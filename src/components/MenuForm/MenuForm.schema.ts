import { z } from "zod";
import { type ZodReturnType } from "~/utils";
import { MAX_IMAGE_SIZE, SUPPORTED_IMAGE_FORMATS } from "~/utils/images";
import { asOptionalField } from "~/utils/utils";

export const menuValidationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  city: z.string().min(2),
  address: z.string().min(3),
  contactPhoneNumber: asOptionalField(z.string()),
  contactEmail: asOptionalField(z.string().email()),
});

export type UpsertMenuFormValues = ZodReturnType<typeof menuValidationSchema>;
