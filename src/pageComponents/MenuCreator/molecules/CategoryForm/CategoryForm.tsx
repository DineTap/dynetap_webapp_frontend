import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormInput } from "~/components/FormInput/FormInput";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import {
  type AddCategoryFormValues,
  addCategoryValidationSchema,
} from "./CategoryForm.schema";

export const CategoryForm = ({
  defaultValues,
  onClose,
}: {
  defaultValues?: Partial<AddCategoryFormValues>;
  onClose: () => void;
}) => {
  const { mutateAsync } = api.menus.upsertCategory.useMutation();
  const { t } = useTranslation();

  const form = useForm<AddCategoryFormValues>({
    defaultValues: {
      name: "",
      ...defaultValues,
    },
    resolver: zodResolver(addCategoryValidationSchema),
  });
  const { slug } = useParams() as { slug: string };
  const { data: menuData, isLoading } = api.menus.getMenuBySlug.useQuery({
    slug,
  });
  const onSubmit = async (values: AddCategoryFormValues) => {
    if (!menuData) return;

    await mutateAsync({ ...values, menuId: menuData.id });
    onClose();
  };

  if (isLoading || !menuData) return null;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormInput label={t("categoryForm.categoryName")}>
                <Input {...field} placeholder="Burgery" />
              </FormInput>
            )}
          />
        </div>
        <Button loading={form.formState.isSubmitting} type="submit">
          {t("categoryForm.save")}
        </Button>
      </form>
    </Form>
  );
};
