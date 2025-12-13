"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "~/components/Icons";
import { LoadingScreen } from "~/components/Loading";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { mockApi as api } from "~/lib/mockApi";
import { getBaseUrl } from "~/utils/getBaseUrl";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode.react";

interface RestaurantDashboardProps {
  slug: string;
}

export default function RestaurantDashboard({ slug }: RestaurantDashboardProps) {
  const { data, error, isLoading } = api.menus.getMenuBySlug.useQuery({ slug });
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const { mutateAsync: publishMenu } = api.menus.publishMenu.useMutation();
  const { mutateAsync: unpublishMenu } = api.menus.unpublishMenu.useMutation();

  const handleTogglePublish = async () => {
    if (!data) return;
    if (data.isPublished) {
      await unpublishMenu({ menuId: data.id });
      toast({
        title: t("restaurantDashboard.menuUnpublishedNotification"),
        description: t(
          "restaurantDashboard.menuUnpublishedNotificationDescription",
        ),
      });
    } else {
      await publishMenu({ menuId: data.id });
      toast({
        title: t("restaurantDashboard.menuPublishedNotification"),
        description: t(
          "restaurantDashboard.menuPublishedNotificationDescription",
        ),
      });
    }
  };

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: t("restaurantDashboard.menuNotFound"),
        variant: "destructive",
      });
      // Use replace to prevent the user from going back to the error page
      router.replace("/dashboard");
    }
  }, [error, router, toast, t]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return null;
  }

  return (
    <>
      <div className="flex w-full max-w-3xl flex-col  gap-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="flex flex-col justify-center gap-2">
            <h1 className="text-3xl font-semibold">
              {data?.name}
            </h1>
            <div className="flex flex-row gap-2">
              <Icons.map />
              <h3 className="text-md">
                {data?.city}, {data?.address}
              </h3>
            </div>
            {data?.contactNumber && (
              <h3 className="text-md">📞 {data?.contactNumber}</h3>
            )}
            {data?.contactEmail && (
              <h3 className="text-md">✉️ {data?.contactEmail}</h3>
            )}
          </div>
          <div className="flex flex-col  gap-2">
            <p className="text-center text-lg font-semibold text-primary">
              {t("restaurantDashboard.restaurant")}{" "}
              {data?.isPublished
                ? t("restaurantDashboard.menuPublished")
                : t("restaurantDashboard.menuNotPublished")}
            </p>
            <Button
              size="lg"
              onClick={handleTogglePublish}
              variant={data?.isPublished ? "destructive" : "default"}
            >
              {data?.isPublished
                ? t("restaurantDashboard.unpublish")
                : t("restaurantDashboard.publish")}
            </Button>
          </div>
        </div>
        <hr />
        <div className="flex flex-col justify-evenly gap-4 md:flex-row">
          <Link href={`/menu/${data?.slug}/preview`} target="_blank">
            <div className="flex flex-row items-center gap-2">
              <Icons.menuSquare />
              <p className="text-xl font-semibold">
                {t("restaurantDashboard.menuPreview")}
              </p>
            </div>
          </Link>
          <Link href={`/menu/manage/${slug}/menu`} target="_blank">
            <div className="flex flex-row items-center gap-2">
              <Icons.edit />
              <p className="text-xl font-semibold">
                {t("restaurantDashboard.manageMenu")}
              </p>
            </div>
          </Link>
        </div>
        <hr />

        <div className="flex w-full grow flex-col gap-8 md:flex-row md:gap-0">
          <div className="flex w-full shrink grow flex-col items-center justify-center gap-4 border-r-2 border-secondary">
            <p className="text-3xl font-semibold">
              {t("restaurantDashboard.yourQRCode")}
            </p>
            <div className="flex flex-col gap-4">
              <QRCode size={200} value={`${getBaseUrl()}/menu/${data?.slug}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}