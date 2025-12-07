import { PrefetchTRPCQuery } from "~/components/PrefetchTRPCQuery/PrefetchTRPCQuery";
import { LayoutView } from "./_components/LayoutView";

async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PrefetchTRPCQuery queryName="menus.getMenuBySlug" params={{ slug }}>
      <LayoutView>{children}</LayoutView>
    </PrefetchTRPCQuery>
  );
}

export default RootLayout;
