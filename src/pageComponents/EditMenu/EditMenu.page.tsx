"use client";

import { useParams, useRouter } from "next/navigation";
import { LoadingScreen } from "~/components/Loading";
import { MenuForm } from "~/components/MenuForm/MenuForm";
import { api } from "~/trpc/react";
import { DashboardHeader } from "./molecules/Header";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export const EditMenuPage = () => {
  const { slug } = useParams() as { slug: string };
  const { data, error, isLoading } = api.menus.getMenuBySlug.useQuery({ slug });
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      router.push("/dashboard");
    }
  }, [error, router]);

  if (isLoading || !data) return <LoadingScreen />;

  if (error) return null;

  return (
    <main className="flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-hidden">
      <DashboardHeader
        heading={t("editMenu.header")}
        text={t("editMenu.title")}
      />
      <MenuForm
        defaultValues={{
          address: data.address,
          city: data.city,
          name: data.name,
          contactPhoneNumber: data.contactNumber || undefined,
          id: data.id,
        }}
      />
    </main>
  );
};
