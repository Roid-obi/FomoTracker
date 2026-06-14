import { table } from "@/lib/databases/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export namespace AiconModel {
  export const messageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1, "Pesan tidak boleh kosong"),
    createdAt: z.coerce.date().optional(),
  });
  export type messageSchema = z.infer<typeof messageSchema>;

  export const requestSchema = z.object({
    session: z.number().int().positive().optional(),
    message: z.string().min(1, "Pesan tidak boleh kosong"),
  });
  export type requestSchema = z.infer<typeof requestSchema>;

  export const historySchema = z.array(messageSchema);
  export type historySchema = z.infer<typeof historySchema>;

  export const chatResponseSchema = z.object({
    message: messageSchema,
    session: z.number().int().positive(),
  });
  export type chatResponseSchema = z.infer<typeof chatResponseSchema>;

  export const insertAiConversationSchema = createInsertSchema(
    table.aiConversations,
  );
  export type insertAiConversationSchema = z.infer<
    typeof insertAiConversationSchema
  >;
}
