"use client";

import Image from "next/image";
import { Icons } from "~/components/Icons";
import { LoadingScreen } from "~/components/Loading";
import { useToast } from "~/components/ui/use-toast";
import { mockApi as api } from "~/lib/mockApi";
import {
  AddDishButton,
  EditDishButton,
} from "./molecules/AddDishButton/AddDishButton";
import { EmptyPlaceholder } from "~/components/EmptyPlaceholder";
import {
  AddCategoryButton,
  EditCategoryButton,
} from "./molecules/AddCategoryButton/AddCategoryButton";
import { DeleteDishButton } from "./molecules/DeleteDishButton/DeleteDishButton";
import { useTranslation } from "react-i18next";
import { type TagType } from "~/lib/types";
import { useHandleFetchError } from "~/shared/hooks/useHandleFetchError";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatPrice } from "~/utils/formatPrice";

export const MenuCreatorPage = ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const { data, error, isLoading } = api.menus.getMenuBySlug.useQuery({ slug });
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: t("notifications.menuNotFound"),
        variant: "destructive",
      });
      router.push("/");
    }
  }, [error, router, toast, t]);

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <LoadingScreen />;

  // Ensure data structure exists
  const menuData = data as any;
  const categories = Array.isArray(menuData?.categories) ? menuData.categories : [];
  const dishes = Array.isArray(menuData?.dishes) ? menuData.dishes : [];

  // Group dishes by category
  const categoriesWithDishes = categories.map((category: any) => ({
    category,
    dishes: dishes.filter((dish: any) => dish.categoryId === category.id)
  }));

  // Add uncategorized dishes
  const uncategorizedDishes = dishes.filter((dish: any) => !dish.categoryId);
  if (uncategorizedDishes.length > 0) {
    categoriesWithDishes.push({
      category: null,
      dishes: uncategorizedDishes
    });
  }

  return (
    <div className="my-12 flex w-full max-w-3xl flex-col gap-6 ">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-0">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="whitespace-nowrap text-3xl font-semibold">
                {data.name}
              </h1>
              <div className="flex flex-row items-center gap-1">
                <Icons.map size={16} />
                <h3 className="whitespace-nowrap text-sm text-muted-foreground">
                  {data.city}, {data.address}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-col                                                                      justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-3xl font-bold">{t("menuCreator.dishesList")}</h2>
          <div className="flex flex-row items-center gap-3">
            <AddDishButton />
            <AddCategoryButton />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {categoriesWithDishes.map(({ category, dishes }: any) => (
          <div
            className="flex w-full flex-col gap-6"
            key={category?.id ?? "no-category"}
          >
            <hr />
            <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center md:gap-0 ">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">
                  {category?.name ?? t("menuCreator.noCategory")}
                </h3>
              </div>
              <div className="flex flex-row items-center gap-4">
                <AddDishButton
                  defaultValues={{
                    categoryId: category?.id || "",
                  }}
                  buttonText={t("menuCreator.AddDishesToCategory")}
                  buttonProps={{ variant: "outline" }}
                />
                {category && (
                  <EditCategoryButton
                    defaultValues={{
                      id: category.id,
                      name: category.name,
                    }}
                  />
                )}
              </div>
            </div>
            {dishes.length === 0 && (
              <EmptyPlaceholder className="min-h-[100px]">
                <EmptyPlaceholder.Title className="text-lg">
                  {t("menuCreator.noDishes")}
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description className="text-sm">
                  {t("menuCreator.noDishesDescription")}
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
            {dishes.map((dish: any, idx: number) => (
              <div key={dish.id}>
                <DishItem
                  id={dish.id}
                  name={dish.name}
                  description={dish.description}
                  price={dish.price}
                  pictureUrl={dish.pictureUrl}
                  categoryId={dish.categoryId}
                />
                {idx !== dishes.length - 1 && (
                  <hr className="mx-auto w-11/12" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const DishItem = ({
  id,
  name,
  description,
  price,
  pictureUrl,
  categoryId,
}: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pictureUrl: string | null;
  categoryId?: string | null;
}) => {
  return (
    <div className="flex flex-col border border-muted px-6 pb-4 pt-6 shadow-sm">
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-row items-center gap-3">
          {pictureUrl && (
            <div className="relative aspect-square h-20 w-20">
              <Image
                src={pictureUrl}
                alt={name}
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
          <div className="flex w-full flex-col py-2">
            <div className="flex w-full flex-row items-center gap-3">
              <p className="text-xl font-medium">{name}</p>
            </div>
            <p className="text-sm ">{formatPrice(price)}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-row items-center gap-3">
            <EditDishButton
              defaultValues={{
                price: price / 100,
                id,
                name,
                description: description || "",
                categoryId: categoryId || "",
                imageUrl: pictureUrl,
                tags: [],
              }}
            />
            <DeleteDishButton id={id} dishName={name} />
          </div>
        </div>
      </div>
    </div>
  );
};
