import DOMPurify from "dompurify";
import { DurableObject } from "cloudflare:workers";
import {
  BufferEvent,
  ExcalidrawElementChangeSchema,
  ExcalidrawFileChangeSchema,
} from "@repo/schemas/events";

export class ExcalidrawWebSocketServer extends DurableObject<Cloudflare> {
  elements: any[] = [];
  files: Record<string, any> = {};

  constructor(ctx: DurableObjectState, env: Cloudflare) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.elements = (await ctx.storage.get("elements")) || [];
      this.files = (await ctx.storage.get("files")) || {};
    });
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[1];
    const server = webSocketPair[0];
    this.ctx.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    if (message === "setup") {
      ws.send(
        JSON.stringify(
          ExcalidrawElementChangeSchema.parse({
            type: "elementChange",
            data: this.elements,
            userId: "server",
          }),
        ),
      );
      ws.send(
        JSON.stringify(
          ExcalidrawFileChangeSchema.parse({
            type: "fileChange",
            data: this.files,
            userId: "server",
          }),
        ),
      );
      return;
    }

    this.broadcastMsg(ws, message);
  }

  webSocketClose(ws: WebSocket) {
    console.log("WebSocket closed");
  }

  webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
    console.log("Error:", error);
  }

  broadcastMsg(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string") {
      for (const session of this.ctx.getWebSockets()) {
        if (session !== ws) {
          session.send(message);
        }
      }
      return;
    }

    const event = BufferEvent.parse(JSON.parse(message));

    if (event.type === "elementChange") {
      const sanitizedElements = event.data.map((element: any) => {
        if (element.type === "text" && element.text) {
          return { ...element, text: DOMPurify.sanitize(element.text) };
        }
        return element;
      });
      event.data = sanitizedElements;
      this.elements = event.data;
      this.ctx.storage.put("elements", this.elements);
    }

    if (event.type === "fileChange") {
      const fileId = Object.keys(event.data)[0];
      this.files = { ...this.files, [fileId]: event.data[fileId] };
      this.ctx.storage.put("files", this.files);
    }

    const sanitizedMessage = JSON.stringify(event);

    for (const session of this.ctx.getWebSockets()) {
      if (session !== ws) {
        session.send(sanitizedMessage);
      }
    }
  }

  async getElements() {
    return {
      data: this.elements,
    };
  }

  async getFiles() {
    return this.files;
  }
}
