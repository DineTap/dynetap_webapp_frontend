import { CartProvider } from "~/contexts/CartContext";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
