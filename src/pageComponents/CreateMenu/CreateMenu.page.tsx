"use client";

import { MenuForm } from "~/components/MenuForm/MenuForm";
import { DashboardHeader } from "./molecules/Header";
import { DashboardShell } from "../Dashboard/molecules/Shell";
import { useTranslation } from "react-i18next";

export const CreateMenuPage = () => {
  const { t } = useTranslation();

  return (
    <DashboardShell className="w-full max-w-3xl md:mx-auto">
      <DashboardHeader
        heading={t("createMenu.header")}
        text={t("createMenu.title")}
      />
      <MenuForm />
    </DashboardShell>
  );
};
