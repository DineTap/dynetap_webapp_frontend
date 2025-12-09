
import { LayoutView } from "./_components/LayoutView";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutView>{children}</LayoutView>
  );
}

export default RootLayout;
