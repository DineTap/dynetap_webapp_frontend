"use client";

import { Input } from "~/components/ui/input";
import { Form, FormField } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { FormInput } from "~/components/FormInput/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useUser } from "~/providers/AuthProvider/AuthProvider";
import { assert } from "~/utils/assert";
import { useTranslation } from "react-i18next";
import { mockApi as api } from "~/lib/mockApi";
import {
  type UpsertMenuFormValues,
  menuValidationSchema,
} from "./MenuForm.schema";

export const useUpsertMenu = () => {
  const { user } = useUser();
  const { mutateAsync } = api.menus.upsertMenu.useMutation();
  const router = useRouter();
  const { toast } = useToast();
  const upsertMenu = async (values: UpsertMenuFormValues) => {
    try {
      assert(!!user, "User should be logged in.");
      const newMenu = await mutateAsync(values);
      router.push(`/menu/manage/${newMenu.slug}/restaurant`);
    } catch (error) {
      toast({
        title: "Coś poszło nie tak",
        description: "Odśwież stronę i spróbuj ponownie",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return { mutateAsync: upsertMenu };
};

export const MenuForm = ({
  defaultValues,
}: {
  defaultValues?: UpsertMenuFormValues;
}) => {
  const { mutateAsync } = useUpsertMenu();

  const form = useForm<UpsertMenuFormValues>({
    defaultValues: {
      name: "",
      city: "",
      address: "",
      contactPhoneNumber: "",
      ...defaultValues,
    },
    resolver: zodResolver(menuValidationSchema),
  });

  const onSubmit = async (values: UpsertMenuFormValues) => {
    console.log("[Form onSubmit] Called with values:", values);
    console.log("[Form onSubmit] Values keys:", Object.keys(values));
    console.log("[Form onSubmit] name:", values.name, "city:", values.city, "address:", values.address);
    await mutateAsync(values);
  };

  const { t } = useTranslation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-8 p-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormInput label={t("menuForm.nameOfRestaurant")}>
              <Input {...field} />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormInput label={t("menuForm.city")}>
              <Input {...field} />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormInput label={t("menuForm.streetAndNumber")}>
              <Input {...field} />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="contactPhoneNumber"
          render={({ field }) => (
            <FormInput label={t("menuForm.phoneNumber")}>
              <Input {...field} />
            </FormInput>
          )}
        />
        <Button loading={form.formState.isSubmitting}>
          {t("menuForm.save")}
        </Button>
      </form>
    </Form>
  );
};
