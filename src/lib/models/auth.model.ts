import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { table } from "@/lib/databases/schema";

export namespace RegisterModel {
  const baseUserInsert = createInsertSchema(table.users).omit({
    id: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
  });

  export const registerRequest = baseUserInsert.extend({
    email: z.email(),
    password: z.string(),
    avatar: z.instanceof(File).optional(),
  });
  export type registerRequest = z.infer<typeof registerRequest>;
}

export namespace LoginModel {
  export const loginRequest = z.object({
    email: z.email(),
    password: z.string(),
  });
  export type loginRequest = z.infer<typeof loginRequest>;
}
