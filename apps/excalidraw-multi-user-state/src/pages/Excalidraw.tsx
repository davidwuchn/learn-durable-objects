import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  ExcalidrawImperativeAPI,
  SocketId,
  BinaryFiles,
  BinaryFileData,
  Collaborator,
  CollaboratorPointer,
  ExcalidrawElement,
  PointerUpdatePayload,
} from "@excalidraw/excalidraw";
import { useEffect, useState, useRef } from "react";
import useBufferedWebSocket from "../hooks/excalidraw-socket";
import {
  BufferEventType,
  PointerEventSchema,
  PointerEvent,
  ExcalidrawElementChangeSchema,
  ExcalidrawElementChange,
  ExcalidrawFileChangeSchema,
  ExcalidrawFileChange,
} from "@repo/schemas/events";
import { useParams } from "@tanstack/react-router";

function ExcalidrawComponent() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const filesRef = useRef<BinaryFiles>({});
  const { id } = useParams({ from: "/excalidraw/$id" });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get userId from localStorage first
    const storedId = localStorage.getItem("userId");

    if (storedId) {
      setUserId(storedId);
    } else {
      // Generate a new ID if none exists
      const id = Math.random().toString(36).substring(2, 15);
      // Save the ID to localStorage for future use
      localStorage.setItem("userId", id);
      setUserId(id);
    }
  }, []);

  useEffect(() => {
    if (excalidrawAPI) {
      fetch(`/api/get-elements/${id}`)
        .then((res) => res.json())
        .then((data) => {
          excalidrawAPI.updateScene({
            elements: data.elements.data,
          });
          excalidrawAPI.addFiles(Object.values(data.files) as BinaryFileData[]);
        });
    }
  }, [excalidrawAPI, id]);

  const handleMessage = (event: BufferEventType) => {
    if (event.type === "pointer" && event.data.userId === userId) {
      return;
    }
    if (
      (event.type === "elementChange" || event.type === "fileChange") &&
      event.userId === userId
    ) {
      return;
    }
    if (event.type === "pointer") {
      handlePointerEvent(event);
    } else if (event.type === "elementChange") {
      handleElementChangeEvent(event);
    } else if (event.type === "fileChange") {
      handleFileChangeEvent(event);
    }
  };

  const handlePointerEvent = (event: PointerEvent) => {
    if (excalidrawAPI) {
      const allCollaborators = excalidrawAPI.getAppState().collaborators;
      const colaborator: Map<SocketId, Collaborator> = new Map(
        allCollaborators,
      );
      colaborator.set(event.data.userId as SocketId, {
        username: event.data.userId,
        pointer: {
          x: event.data.x,
          y: event.data.y,
          tool: "laser",
        } as CollaboratorPointer,
      });
      if (userId) {
        colaborator.delete(userId as SocketId);
      }
      excalidrawAPI.updateScene({
        collaborators: colaborator,
      });
    }
  };

  const handleElementChangeEvent = (event: ExcalidrawElementChange) => {
    if (excalidrawAPI) {
      // Update the scene with the new elements
      excalidrawAPI.updateScene({
        elements: event.data,
      });
    }
  };

  const handleFileChangeEvent = (event: ExcalidrawFileChange) => {
    if (excalidrawAPI) {
      const fileData = Object.values(event.data).filter(
        (item) => typeof item !== "string",
      );
      excalidrawAPI.addFiles(fileData as BinaryFileData[]);
    }
  };

  const { sendEvent, handlePointerUp } = useBufferedWebSocket(
    handleMessage,
    id,
  );

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="canvas" style={{ height: "800px", width: "100%" }}>
      <Excalidraw
        onPointerUpdate={(payload: PointerUpdatePayload) => {
          sendEvent(
            PointerEventSchema.parse({
              type: "pointer",
              data: {
                userId: userId,
                x: payload.pointer.x,
                y: payload.pointer.y,
              },
            }),
          );
        }}
        onPointerUp={() => {
          if (excalidrawAPI) {
            handlePointerUp(
              ExcalidrawElementChangeSchema.parse({
                type: "elementChange",
                data: excalidrawAPI.getSceneElements(),
                userId,
              }),
            );
          }
        }}
        onChange={(
          elements: readonly ExcalidrawElement[],
          appState,
          files: BinaryFiles,
        ) => {
          const newFileIds = Object.keys(files);
          const oldFileIds = Object.keys(filesRef.current);

          if (newFileIds.length > oldFileIds.length) {
            const newFiles: BinaryFiles = {};
            newFileIds.forEach((id) => {
              if (!oldFileIds.includes(id)) {
                newFiles[id] = files[id];
              }
            });
            if (Object.keys(newFiles).length > 0) {
              const file = Object.values(newFiles)[0] as BinaryFileData;
              (async () => {
                await fetch("/api/files/upload", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    id: file.id,
                    dataURL: file.dataURL,
                    mimeType: file.mimeType,
                  }),
                });
                sendEvent(
                  ExcalidrawFileChangeSchema.parse({
                    type: "fileChange",
                    data: {
                      [file.id]: file,
                    },
                    userId: userId,
                  }),
                );
              })();
            }
          }
          filesRef.current = files;
        }}
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
          setExcalidrawAPI(api);
          if (api) {
            filesRef.current = api.getFiles();
          }
        }}
      />
    </div>
  );
}

export default ExcalidrawComponent;
