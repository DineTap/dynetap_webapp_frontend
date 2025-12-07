"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormInput } from "~/components/FormInput/FormInput";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useTranslation } from "react-i18next";
import { api } from "~/trpc/react";
import {
  type AddDishVariantFormValues,
  dishVariantValidationSchema,
} from "./VariantForm.schema";

export const DishVariantForm = ({
  defaultValues,
  onClose,
  dishId,
}: {
  defaultValues?: Partial<AddDishVariantFormValues>;
  onClose: () => void;
  dishId: string;
}) => {
  const form = useForm<AddDishVariantFormValues>({
    defaultValues: {
      translatedVariant: [
        { languageId: "en", name: "", description: "" },
      ],
      ...defaultValues,
    },
    resolver: zodResolver(dishVariantValidationSchema),
  });

  const { t } = useTranslation();
  // const { mutateAsync } = api.menus.upsertDishVariant.useMutation();

  const onSubmit = async (values: AddDishVariantFormValues) => {
    // await mutateAsync({
    //   ...values,
    //   dishId,
    //   price: values.price ?? 0,
    //   translatedVariant: values.translatedVariant.map((tv) => ({
    //     name: tv.name,
    //     description: tv.description,
    //     language: "en",
    //   })),
    // });
    onClose();
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col gap-4">
          <FormField
            control={form.control}
            name="translatedVariant.0.name"
            render={({ field }) => (
              <FormInput label={t("dishVariantForm.variantName")}>
                <Input {...field} placeholder={t("dishVariantForm.variantNamePlaceholder")} />
              </FormInput>
            )}
          />
          <FormField
            control={form.control}
            name="translatedVariant.0.description"
            render={({ field }) => (
              <FormInput label={t("dishVariantForm.variantDescription")}>
                <Input
                  {...field}
                  placeholder={t("dishVariantForm.variantDescriptionPlaceholder")}
                />
              </FormInput>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormInput label={t("dishVariantForm.priceInPLN")}>
                <Input {...field} type="number" placeholder="10.99" />
              </FormInput>
            )}
          />
        </div>
        <Button loading={form.formState.isSubmitting} type="submit">
          Zapisz
        </Button>
      </form>
    </Form>
  );
};
