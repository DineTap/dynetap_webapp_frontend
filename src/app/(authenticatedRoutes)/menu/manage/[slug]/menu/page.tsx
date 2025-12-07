import { MenuCreatorPage } from "~/pageComponents/MenuCreator/MenuCreator.page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <MenuCreatorPage params={resolvedParams} />;
}
