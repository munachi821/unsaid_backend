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

//Username validation
const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

//password update
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export { updatePreferencesSchema, updateUsernameSchema, updatePasswordSchema };
