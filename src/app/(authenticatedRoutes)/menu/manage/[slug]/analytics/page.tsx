"use client";


import { AnalyticsDashboard } from "~/pageComponents/Analytics/AnalyticsDashboard.page";
import { LoadingScreen } from "~/components/Loading";
import { useParams } from "next/navigation";
import { mockApi as api } from "~/lib/mockApi";

export default function AnalyticsPage() {
    const { slug } = useParams() as { slug: string };
    const { data: menu, isLoading } = api.menus.getMenuBySlug.useQuery({ slug });

    if (isLoading) return <LoadingScreen />;

    if (!menu) return <div>Menu not found</div>;

    return <AnalyticsDashboard menuId={menu.id} restaurantName={menu.name} />;
}
