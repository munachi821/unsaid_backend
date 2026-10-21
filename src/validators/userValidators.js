import z from "zod";

const updatePreferencesSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    allowImages: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.emailNotifications !== undefined || data.allowImages !== undefined,
    {
      message: "At least one prefrence must be provided",
    },
  );

export { updatePreferencesSchema };
