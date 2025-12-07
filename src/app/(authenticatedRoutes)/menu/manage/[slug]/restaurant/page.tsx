import { notFound } from "next/navigation";
import RestaurantDashboard from "~/pageComponents/RestaurantDashboard/RestaurantDashboard.page";

export default async function Page({ params }: { params: Promise<{ slug?: string | string[] }> }) {
  const { slug } = await params;
  const s = Array.isArray(slug) ? slug[0] : slug;
  if (!s) return notFound();
  return <RestaurantDashboard slug={s} />;
}