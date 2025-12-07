import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInput } from "~/components/FormInput/FormInput";
import { ImageUploadInput } from "~/components/ImageUploadInput/ImageUploadInput";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { useUser } from "~/providers/AuthProvider/AuthProvider";
import { assert } from "~/utils/assert";
import { uploadFileToStorage } from "~/utils/uploadFile";
import Select from "react-select";
import { generateDishImagePath } from "~/server/supabase/storagePaths";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import {
  addDishValidationSchemaWithImage,
  type AddDishFormValues,
  type AddDishFormValuesWithImage,
} from "./DishForm.schema";

export const useUpsertDish = () => {
  const { user } = useUser();
  const { mutateAsync } = api.menus.upsertDish.useMutation();
  const { mutateAsync: updateBgImage } =
    api.menus.updateDishImageUrl.useMutation();
  const utils = api.useContext();

  const { slug } = useParams() as { slug: string };
  const { data: menuData } = api.menus.getMenuBySlug.useQuery({ slug });
  const { t } = useTranslation();
  const { toast } = useToast();
  const upsertDish = async (values: AddDishFormValuesWithImage) => {
    try {
      assert(!!user, "User should be logged in.");
      assert(!!menuData, "Menu should be fetched.");
      const { dishImageToUpload, ...dish } = values;

      const newDish = await mutateAsync({ ...dish, menuId: menuData.id });
      let imageUrl: string | undefined | null;

      if (dishImageToUpload) {
        const { url, error } = await uploadFileToStorage(
          generateDishImagePath({
            dishId: newDish.id,
            userId: user.id,
          }),
          dishImageToUpload,
        );

        if (error) throw error;

        imageUrl = url;
      } else if (dishImageToUpload === null) {
        imageUrl = null;
      }

      await updateBgImage({ dishId: newDish.id, imageUrl });
      utils.menus.invalidate();
    } catch (error) {
      toast({
        title: t("notifications.somethingWentWrong"),
        description: t("notifications.tryAgainLater"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return { mutateAsync: upsertDish };
};

export const DishForm = ({
  defaultValues,
  onClose,
}: {
  defaultValues?: Partial<AddDishFormValues>;
  onClose: () => void;
}) => {
  const form = useForm<AddDishFormValuesWithImage>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      ...defaultValues,
    },
    resolver: zodResolver(addDishValidationSchemaWithImage),
  });
  const { slug } = useParams() as { slug: string };
  const { data: menuData, isLoading } = api.menus.getMenuBySlug.useQuery({
    slug,
  });
  const { t } = useTranslation();
  const { data: categoriesList, isLoading: categoriesLoading } =
    api.menus.getCategoriesBySlug.useQuery({
      menuSlug: slug,
    });
  const { mutateAsync } = useUpsertDish();

  const onSubmit = async (values: AddDishFormValuesWithImage) => {
    await mutateAsync(values);
    onClose();
  };

  if (isLoading || !menuData) return null;

  const mappedCategories =
    categoriesList?.map((val) => ({
      value: val.id,
      label: val.name,
    })) || [];

  const categoriesSelectOptions = [
    { value: "", label: t("menuCreator.noCategory") },
    ...mappedCategories,
  ];

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput label={t("dishForm.dishName")}>
                <Input {...field} placeholder="Pierogi Ruskie" />
              </FormInput>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormInput label={t("dishForm.dishDescription")}>
                <Input
                  {...field}
                  placeholder={t("dishForm.descriptionPlaceholder")}
                />
              </FormInput>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormInput label="Price (R)">
                <Input {...field} type="number" placeholder="10.99" />
              </FormInput>
            )}
          />
          <FormInput label={t("dishForm.dishPhoto")}>
            <div className="h-[100px] w-[200px]  ">
              <ImageUploadInput
                control={form.control}
                defaultImageUrl={defaultValues?.imageUrl ?? undefined}
                name="dishImageToUpload"
                aspectRatio={2 / 1}
                cropImageAspectRatio={1 / 1}
                restoreButton={false}
              />
            </div>
          </FormInput>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormInput label={t("dishForm.categoryLabel")}>
                <Select
                  name={field.name}
                  ref={field.ref}
                  value={categoriesSelectOptions.find(
                    (val) => val.value === field.value,
                  )}
                  isSearchable
                  onChange={(val) => field.onChange(val?.value)}
                  options={categoriesSelectOptions}
                  isLoading={categoriesLoading}
                />
              </FormInput>
            )}
          />

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                {t("dishForm.macronutrientsButton")}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 p-4 ">
                  <div className="flex flex-row justify-between gap-4">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormInput
                          label={t("dishForm.calories")}
                          className="w-full"
                        >
                          <Input {...field} type="number" />
                        </FormInput>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormInput
                          label={t("dishForm.weight")}
                          className="w-full"
                        >
                          <Input {...field} type="number" />
                        </FormInput>
                      )}
                    />
                  </div>
                  <div className="flex flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="carbohydrates"
                      render={({ field }) => (
                        <FormInput label={t("dishForm.carbs")}>
                          <Input {...field} type="number" />
                        </FormInput>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fats"
                      render={({ field }) => (
                        <FormInput label={t("dishForm.fat")}>
                          <Input {...field} type="number" />
                        </FormInput>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="proteins"
                      render={({ field }) => (
                        <FormInput label={t("dishForm.protein")}>
                          <Input {...field} type="number" />
                        </FormInput>
                      )}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("dishForm.macronutrientsDescription")}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <Button loading={form.formState.isSubmitting} type="submit">
          {t("menuForm.save")}
        </Button>
      </form>
    </Form>
  );
};
