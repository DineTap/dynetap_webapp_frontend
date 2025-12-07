import Link from "next/link";
import React from "react";

import { UserAuthForm } from "./molecules/UserAuthForm";
import { useServerTranslation } from "~/i18n";

const ContactUsCard = async () => {
  const { t } = await useServerTranslation();

  return (
    <div className="max-w-xs p-6">
      <p className="mb-3 text-lg font-bold">{t("contactUsCard.title")}</p>
      <p className="mb-2 text-base">{t("contactUsCard.subtitle")}</p>
      <p>
        {t("contactUsCard.contactUs")} <strong>support@dynetap.com</strong>
      </p>
    </div>
  );
};

export const Login = async () => {
  const { t } = await useServerTranslation();

  return (
    <div className="rounded-2xl bg-cream shadow-lg border border-brand-light px-8 py-10 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      <div className="w-full flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-24">
        <div className="flex flex-col justify-center gap-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("login.title")}
            </h1>
          </div>
          <UserAuthForm />
          <div className="flex flex-col items-center justify-center gap-2">
            <Link className="text-sm font-medium text-secondary-foreground hover:underline" href="/register">
              {t("login.registerButton")}
            </Link>
            <Link className="text-sm font-medium text-secondary-foreground hover:underline" href="/reset-password">
              {t("login.forgotPasswordButton")}
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ContactUsCard />
        </div>
      </div>
    </div>
  );
};
