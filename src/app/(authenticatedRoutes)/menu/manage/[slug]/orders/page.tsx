"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { mockApi as api } from "~/lib/mockApi";
import { OrdersDashboard } from "~/pageComponents/Orders/OrdersDashboard.page";
import { LoadingScreen } from "~/components/Loading";

export default function OrdersPage() {
    const { slug } = useParams() as { slug: string };
    const { data: menu, isLoading } = api.menus.getMenuBySlug.useQuery({ slug });

    if (isLoading) return <LoadingScreen />;

    if (!menu) return <div>Menu not found</div>;

    return <OrdersDashboard menuId={menu.id} />;
}
