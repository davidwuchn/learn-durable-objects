import { z } from "zod";

// Define the schema for pointer events
export const PointerEventSchema = z.object({
  type: z.literal("pointer"),
  data: z.object({
    userId: z.string(),
    x: z.number(),
    y: z.number(),
  }),
});

export const ExcalidrawElementChangeSchema = z.object({
  type: z.literal("elementChange"),
  data: z.array(z.any()),
  userId: z.string(),
});

export const ExcalidrawFileChangeSchema = z.object({
  type: z.literal("fileChange"),
  data: z.record(z.any()),
  userId: z.string(),
});

export type PointerEvent = z.infer<typeof PointerEventSchema>;
export type ExcalidrawElementChange = z.infer<
  typeof ExcalidrawElementChangeSchema
>;

export type ExcalidrawFileChange = z.infer<typeof ExcalidrawFileChangeSchema>;

export const BufferEvent = z.union([
  PointerEventSchema,
  ExcalidrawElementChangeSchema,
  ExcalidrawFileChangeSchema,
]);

export type BufferEventType = z.infer<typeof BufferEvent>;
