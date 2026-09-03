import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address.")
    .max(254, "Email address must be 254 characters or fewer."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type AuthActionState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
  status?: "error" | "success";
};
