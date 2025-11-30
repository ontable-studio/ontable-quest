import * as z from "zod";

// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation - at least 6 characters, one letter, one number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

// Name validation - letters, spaces, hyphens, apostrophes only
const nameRegex = /^[a-zA-Z\s'-]+$/;

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 2,
      { message: "Name must be at least 2 characters long if provided" }
    )
    .refine(
      (val) => !val || val.length <= 50,
      { message: "Name must be 50 characters or less" }
    )
    .refine(
      (val) => !val || nameRegex.test(val),
      { message: "Name can only contain letters, spaces, hyphens, and apostrophes" }
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be 128 characters or less")
    .regex(
      passwordRegex,
      "Password must contain at least one letter and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be 128 characters or less")
    .regex(
      passwordRegex,
      "Password must contain at least one letter and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

// Change email validation
export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Change password validation - enhanced requirements
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Profile update validation
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  avatar: z
    .url("Must be a valid URL")
    .max(500, "Avatar URL must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

// Type exports
export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;