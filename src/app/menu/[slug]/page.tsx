import { type Metadata } from "next";
import { api } from "~/trpc/server";
import { buildTimeDb } from "~/server/db";

export const revalidate = 60;

export async function generateStaticParams() {
    const menus = await buildTimeDb.menus.findMany({
        where: {
            isPublished: true,
        },
        select: {
            slug: true,
        },
    });
    
    return menus.map((menu) => ({
        slug: menu.slug,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const data = await api.menus.getPublicMenuBySlug({ slug }).catch(() => {
    return null;
  });

  if (!data) return {};

  return {
    title: `${data.name} Menu`,
    description: `${data.address} | ${data.city}`,
    openGraph: {
      title: `${data.name} Menu`,
      description: `${data.address} | ${data.city}`,
      url: "https://dynetap.com",
      siteName: "DyneTap",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} Menu`,
      description: `${data.address} | ${data.city}`,
      site: "@dynetap",
    },
  };
}

export { MenuPage as default } from "~/pageComponents/Menu/Menu.page";
