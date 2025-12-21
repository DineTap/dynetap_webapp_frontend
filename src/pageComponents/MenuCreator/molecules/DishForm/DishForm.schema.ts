import { type TFunction } from "i18next";
import { z } from "zod";
import { type ZodReturnType } from "~/utils";
import { SUPPORTED_IMAGE_FORMATS } from "~/utils/images";

export const addDishValidationSchema = (t: TFunction<"common">) =>
  z.object({
    id: z.string().optional(),
    name: z.string().min(3, {
      message: t("dishForm.validation.dishNameRequired"),
    }),
    description: z.string().min(3).optional().or(z.literal("")),
    price: z.coerce
      .number()
      .min(0.01, { message: t("dishForm.validation.priceRequired") }),
    imageUrl: z.string().nullable().optional(),
    categoryId: z
      .string()
      .min(1, { message: t("dishForm.validation.categoryRequired") }),
    calories: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    proteins: z.coerce.number().optional(),
    fats: z.coerce.number().optional(),
    carbohydrates: z.coerce.number().optional(),
    tags: z.array(z.string()).optional(),
  });

export const addDishValidationSchemaWithImage = (t: TFunction<"common">) =>
  addDishValidationSchema(t).extend({
    dishImageToUpload: z
      .custom<Blob>((val) => val instanceof Blob)
      .refine(
        (files) => files?.size <= 5 * 1024 * 1024,
        t("dishForm.validation.imageSize"),
      )
      .refine(
        (files) => SUPPORTED_IMAGE_FORMATS.has(files?.type),
        t("dishForm.validation.imageFormat"),
      )
      .optional(),
  });

export type AddDishFormValues = ZodReturnType<
  ReturnType<typeof addDishValidationSchema>
>;

export type AddDishFormValuesWithImage = ZodReturnType<
  ReturnType<typeof addDishValidationSchemaWithImage>
>;
