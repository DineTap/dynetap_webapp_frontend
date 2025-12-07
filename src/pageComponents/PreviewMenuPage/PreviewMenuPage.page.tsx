"use client";

import { notFound } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LoadingScreen } from "~/components/Loading";
import { MainMenuView } from "~/components/MainMenuView/MainMenuView";
import { useToast } from "~/components/ui/use-toast";
import { useHandleFetchError } from "~/shared/hooks/useHandleFetchError";
import { api } from "~/trpc/react";

interface PreviewMenuPageProps {
  params: {
    slug: string;
  };
}

export const PreviewMenuPage = ({ params }: PreviewMenuPageProps) => {
  const { slug } = params;
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    data: menu,
    isLoading,
    error,
  } = api.menus.getMenuBySlug.useQuery({ slug });

  useHandleFetchError({
    error: error as any,
    onError: () =>
      toast({
        title: "Error",
        description: t("notifications.menuNotFound"),
        variant: "destructive",
      }),
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !menu) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl">
      <MainMenuView menu={menu} />
    </main>
  );
};
