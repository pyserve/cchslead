import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRequiredFields(schema: z.ZodObject<any>) {
  const shape = schema.shape;

  return Object.entries(shape)
    .filter(([_, val]: any) => {
      return !(
        val instanceof z.ZodOptional ||
        val instanceof z.ZodDefault ||
        val.isOptional?.()
      );
    })
    .map(([key]) => key);
}

export const prepareFormData = async (data: any) => {
  const formData = new FormData();

  formData.append("leadSource", data.leadSource);
  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("email", data.email);
  formData.append("mobileNumber", data.mobileNumber);
  formData.append("homeNumber", data.homeNumber);
  formData.append("fullAddress", data.fullAddress);
  formData.append("streetAddress", data.streetAddress);
  formData.append("city", data.city);
  formData.append("state", data.state);
  formData.append("zipCode", data.zipCode);
  formData.append("country", data.country);
  formData.append("meetingDate", data.meetingDate);
  formData.append("meetingTime", data.meetingTime);
  formData.append("leadType", data.leadType);
  formData.append("notes", data.notes);

  // data.interestedIn.forEach((item: string) => {
  //   formData.append("interestedIn[]", item);
  // });

  // if (data.file && data.file.path) {
  //   formData.append("file", data.file);
  // }

  return formData;
};
