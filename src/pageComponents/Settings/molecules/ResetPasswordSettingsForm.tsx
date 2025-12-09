"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { type TFunction } from "i18next";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { FormInput } from "~/components/FormInput/FormInput";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

import { type ZodReturnType } from "~/utils";

export const resetPasswordSettingsFormValidationSchema = (
  translate: TFunction,
) =>
  z
    .object({
      password: z
        .string()
        .min(8, translate("common.passwordLengthValidation"))
        .regex(/[A-Z]/, translate("common.passwordUppercaseValidation"))
        .regex(/[a-z]/, translate("common.passwordLowercaseValidation"))
        .regex(
          /[^A-Za-z0-9]/,
          translate("common.passwordSpecialCharacterValidation"),
        ),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: translate("common.passwordConfirmationValidation"),
      path: ["passwordConfirmation"],
    });

type RegisterFormValues = ZodReturnType<
  typeof resetPasswordSettingsFormValidationSchema
>;

export function ResetPasswordSettingsForm() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(resetPasswordSettingsFormValidationSchema(t)),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async ({ password }: RegisterFormValues) => {
    try {
      // Mock update password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "",
        description: t("resetPassword.passwordChangedSuccesfully"),
        variant: "topDescructive",
        duration: 9000,
      });
    } catch (e) {
      // Handle error
    }
  };

  return (
    <Form {...form}>
      <form
        className="grid w-[400px] gap-6"
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("resetPassword.title")}
          </h1>
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormInput label={t("common.passwordLabel")}>
              <Input {...field} type="password" />
            </FormInput>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormInput label={t("common.passwordConfirmLabel")}>
              <Input {...field} type="password" />
            </FormInput>
          )}
        />
        <Button loading={form.formState.isSubmitting} type="submit">
          {t("resetPassword.resetButton")}
        </Button>
      </form>
    </Form>
  );
}
