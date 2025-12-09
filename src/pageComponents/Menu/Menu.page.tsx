import { notFound } from "next/navigation";
import React from "react";
import { MainMenuView } from "~/components/MainMenuView/MainMenuView";
import { mockApi as api } from "~/lib/mockApi";

export const MenuPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const data = await api.menus.getPublicMenuBySlug({ slug }).catch((error) => {
    console.error("Error fetching menu:", error);
    return null;
  });

  if (!data || !data.isPublished) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl">
      <MainMenuView menu={data} />
    </main>
  );
};
