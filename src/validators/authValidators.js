import z from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email");

const SignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const resendVerificationSchema = z.object({
  email: emailSchema,
});

const googleLoginSchema = z.object({
  token: z.string().min(1, "token is required"),
});

export {
  SignUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  googleLoginSchema,
};
