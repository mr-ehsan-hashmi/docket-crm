import { z } from "zod";
import {
  CONTACT_STATUSES,
  PRACTICE_AREAS,
  REFERRAL_SOURCES,
} from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_CHARS = /^[\d\s()+\-.]+$/;

export const MATTER_SUMMARY_LIMIT = 600;

function countDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

export const contactFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Enter the person's full name.")
      .min(2, "A name needs at least two characters.")
      .max(80, "Keep the name under 80 characters."),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || EMAIL_PATTERN.test(value), {
        message: "That email looks incomplete. Check the part after the @.",
      }),
    phone: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" ||
          (PHONE_ALLOWED_CHARS.test(value) &&
            countDigits(value) >= 7 &&
            countDigits(value) <= 15),
        { message: "Use 7 to 15 digits, for example +1 415 555 0132." },
      ),
    practiceArea: z
      .union([z.literal(""), z.enum(PRACTICE_AREAS)])
      .transform((value, ctx) => {
        if (value === "") {
          ctx.issues.push({
            code: "custom",
            message: "Pick the practice area so the right team sees this.",
            input: value,
          });
          return z.NEVER;
        }
        return value;
      }),
    referralSource: z.enum(REFERRAL_SOURCES),
    status: z.enum(CONTACT_STATUSES),
    assignedTo: z.string(),
    matterSummary: z
      .string()
      .trim()
      .max(
        MATTER_SUMMARY_LIMIT,
        `Keep the summary under ${MATTER_SUMMARY_LIMIT} characters. Longer detail belongs in a note.`,
      ),
  })
  .refine((values) => values.email !== "" || values.phone !== "", {
    path: ["phone"],
    message: "Add a phone number or an email. We need one way to follow up.",
  });

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.output<typeof contactFormSchema>;

export const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something before saving the note.")
    .max(2000, "Keep notes under 2,000 characters."),
});
export type NoteFormValues = z.infer<typeof noteSchema>;
