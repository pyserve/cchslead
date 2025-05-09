import { z } from "zod";

const MAX_SIZE = 4.5 * 1024 * 1024;

export const formSchema = z.object({
  // Tab 1 - Lead Types
  leadSource: z.string({
    required_error: "Please select a lead source",
  }),

  // Tab 2 - Contact Information
  firstName: z.string().min(1, {
    message: "First name must be at least 1 characters.",
  }),
  lastName: z.string().min(1, {
    message: "Last name must be at least 1 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .nullable()
    .optional()
    .transform((val) => val ?? ""),
  mobileNumber: z.string().min(10, {
    message: "Mobile number must be at least 10 digits.",
  }),
  homeNumber: z
    .string()
    .optional()
    .transform((val) => val ?? ""),

  // Tab 3 - Address and Additional Info
  fullAddress: z.string().min(1, {
    message: "Address must be at least 1 characters.",
  }),
  streetAddress: z.string().min(1, {
    message: "Street address is required.",
  }),
  city: z.string().min(1, {
    message: "City is required.",
  }),
  state: z.string().min(1, {
    message: "State is required.",
  }),
  zipCode: z.string().min(3, {
    message: "Zip code must be atleast 3 characters.",
  }),
  country: z.string().min(1, {
    message: "Country is required.",
  }),
  meetingTime: z.string().min(1, "Please select a meeting time."),
  leadType: z.string().min(1, "Please select a lead type."),
  interestedIn: z
    .array(z.string())
    .optional()
    .transform((val) => val ?? ""),
  file: z
    .union([
      z.instanceof(File),
      z.instanceof(Blob),
      z.string().min(1, "File data string is required"),
    ])
    .optional()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val instanceof File ||
        val instanceof Blob ||
        typeof val === "string",
      {
        message: "Please upload a valid file, blob, or base64 string.",
      }
    )
    .refine(
      (val) => {
        if (!val) return true;

        if (val instanceof File || val instanceof Blob) {
          return val.size <= MAX_SIZE;
        }

        if (typeof val === "string") {
          // Estimate base64 size
          const base64Length = val.length - (val.indexOf(",") + 1);
          const sizeInBytes = Math.ceil((base64Length * 3) / 4);
          return sizeInBytes <= MAX_SIZE;
        }

        return false;
      },
      {
        message: `File must be less than ${MAX_SIZE / (1024 * 1024)} MB.`,
      }
    ),
});
