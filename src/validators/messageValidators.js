import z from "zod";

const sendMessageSchema = z.object({
  message: z
    .string()
    .max(250, "Message must not exceed 250 characters")
    .optional(),
});
const clearAllMessagesSchema = z.object({
  confirmation: z.literal(true, {
    errorMap: () => ({
      message: "Confirmation must be true to clear all messages",
    }),
  }),
});
export { sendMessageSchema, clearAllMessagesSchema };
