import { z } from "zod";

export namespace UserModel {
  export const userData = z.object({
    name: z.string(),
    avatarUrl: z.string().nullable(),
    email: z.email(),
  });
  export type userData = z.infer<typeof userData>;

  export const updateRequest = z.object({
    name: z.string().optional(),
    avatar: z.instanceof(File).optional(),
  });
  export type updateRequest = z.infer<typeof updateRequest>;

  export const updateData = z.object({
    name: z.string(),
    avatarUrl: z.string(),
    updatedAt: z.date(),
  });
  export type updateData = z.infer<typeof updateData>;
}
