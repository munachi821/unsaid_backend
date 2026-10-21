import z from "zod";

const sendMessageSchema = z.object({
  message: z
    .string()
    .max(250, "Message must not exceed 250 characters")
    .optional(),
});

export { sendMessageSchema };
