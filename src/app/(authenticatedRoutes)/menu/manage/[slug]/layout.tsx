
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
    <LayoutView>{children}</LayoutView>
  );
}

export default RootLayout;
