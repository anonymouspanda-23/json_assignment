import { z } from "zod";

export const UserSchema = z.strictObject({
  id: z.uuidv4({ error: "A valid ID is required." }),
  name: z.string().min(1, { error: "Name is required." }),
  email: z.email({ error: "Email is required." }),
  phone_number: z
    .string()
    .regex(/(?:\\+?65[\\s]?)?[3689]\\d{3}[\\s]?\\d{4}/, { error: "A valid Singapore phone number is required."}),
  deleted: z.boolean().default(false)
});

export type User = z.infer<typeof UserSchema>;

export const UserResponseSchema = UserSchema.omit({ deleted: true });
export type UserResponseDto = z.infer<typeof UserResponseSchema>;

export const UserIdSchema = z.strictObject({
  id: z.uuidv4({ error: "A valid ID is required." }),
}).transform(params => params.id);