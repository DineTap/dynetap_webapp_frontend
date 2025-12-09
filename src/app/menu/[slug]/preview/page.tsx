import { type Metadata } from "next";
import { PreviewMenuPage } from "~/pageComponents/PreviewMenuPage/PreviewMenuPage.page";
import { mockApi as api } from "~/lib/mockApi";

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

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  return <PreviewMenuPage params={params} />;
}
