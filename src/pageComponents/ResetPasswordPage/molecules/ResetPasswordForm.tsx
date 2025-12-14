import { zodResolver } from "@hookform/resolvers/zod";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormInput } from "~/components/FormInput/FormInput";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { getBaseUrl } from "~/utils/getBaseUrl";
import {
  type RegisterFormValues,
  resetPasswordValidationSchema,
} from "./ResetPasswordForm.schema";

export function ResetPasswordForm() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(resetPasswordValidationSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Mock password reset
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: t("resetPassword.checkYourEmailToReset"),
        description: t("register.checkYourEmailForConfirmation"),
        variant: "topDescructive",
      });
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
              <Input {...field} autoComplete="email" />
            </FormInput>
          )}
        />

        <Button loading={form.formState.isSubmitting} type="submit">
          {t("resetPassword.resetButton")}
        </Button>
      </form>
      <div className="mt-4">
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          Back to login
        </Link>
      </div>
    </Form>
  );
}
