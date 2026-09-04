import { z } from "zod";

export const shareOperationSchema = z.enum([
  "enable",
  "disable",
  "regenerate",
]);

export const shareTokenSchema = z.uuid();

export type ShareActionState = {
  enabled: boolean;
  message?: string;
  status?: "error" | "success";
  token: string | null;
};
