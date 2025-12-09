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

const registerValidationSchema = (translate: TFunction) =>
  z
    .object({
      email: z.string().email(),
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

type RegisterFormValues = ZodReturnType<typeof registerValidationSchema>;

const translations = {
  en: {
    hello: "Hello",
    confirmYourEmailAddress: "Confirm your email address.",
    resetYourEmail: "Reset your email.",
    confirmYourEmailAddressDescription:
      "Please confirm your email address by clicking the button below.",
    resetYourEmailDescription:
      "Click the button below to reset your email address.",
    buttonText: "Continue",
    orCopyAndPaste: "or copy and paste this URL into your browser:",
  },
  pl: {
    hello: "Witaj",
    confirmYourEmailAddress: "Potwierdź swój adres email.",
    resetYourEmail: "Zresetuj Adres Email.",
    confirmYourEmailAddressDescription:
      "Potwierdź swój adres email klikając w przycisk poniżej.",
    buttonText: "Kontynuuj",
    orCopyAndPaste: "lub skopiuj i wklej ten adres URL do przeglądarki:",
  },
};

export function UserAuthForm() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerValidationSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Mock successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/dashboard";

    } catch (e) {
      // Handle error
    }
  };

  return (
    <Form {...form}>
      <form
        className="grid gap-6"
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormInput label={t("common.emailLabel")}>
              <Input {...field} />
            </FormInput>
          )}
        />
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
          {t("register.submitButton")}
        </Button>
      </form>
    </Form>
  );
}
