import { type RouterOutputs } from "~/trpc/shared";
// import { getCategoryTranslations } from "./categoriesUtils"; // commented out

export type FullMenuOutput = RouterOutputs["menus"]["getMenuBySlug"];

// type CategoryWithTranslations = {
//   id: string;
//   name: string;
//   sortOrder: number | null;
//   categoriesTranslation?: { name: string; languageId: string }[];
// };

export const parseDishes = (
  menu: FullMenuOutput,
  // selectedLanguage: string, // commented out
) => {
  // Ensure categories exist
  const categories = menu.categories ?? [];

  // Map dishes under categories
  const categorizedDishes = categories.map((category) => ({
    category,
    dishes: menu.dishes?.filter((dish) => dish.categoryId === category.id) ?? [],
    // categoriesTranslation: category.categoriesTranslation ?? [], // commented out
    // name: getCategoryTranslations({
    //   category: { ...category, categoriesTranslation: category.categoriesTranslation ?? [] },
    //   languageId: selectedLanguage,
    // }),
  }));

  // Dishes without categories
  const dishesWithoutCategories = menu.dishes?.filter((dish) => !dish.categoryId) ?? [];

  const allDishesWithCategories = [
    ...categorizedDishes,
    { category: null, dishes: dishesWithoutCategories },
  ];

  // Sort categorized dishes by category name
  const sortedDishesByCategoryName = [...categorizedDishes].sort((a, b) =>
    a.category?.name.localeCompare(b.category?.name ?? "") ?? 0,
  );

  // Dishes without a category
  const noCategoryDishes = allDishesWithCategories.filter((cat) => cat.category === null);

  const sortedDishes = [...noCategoryDishes, ...sortedDishesByCategoryName];

  // Apply translations for dishes
  const dishesWithVariants = sortedDishes.map((category) => ({
    category: category.category,
    dishes: category.dishes.map((dish) => ({
      ...dish,
      // const selectedTranslation = dish.dishesTranslation?.find(
      //   (t) => t.languageId === selectedLanguage,
      // );
      // const backupTranslation = dish.dishesTranslation?.[0] ?? { name: "-", description: "-" };
      // name: selectedTranslation?.name ?? backupTranslation.name,
      // description: selectedTranslation?.description ?? backupTranslation.description,

      // Apply translations for variants
      // translatedDishVariants: dish.dishVariants?.map((variant) => {
      //   const selectedVariantTranslation = variant.variantTranslations?.find(
      //     (t) => t.languageId === selectedLanguage,
      //   );
      //   const backupVariantTranslation = variant.variantTranslations?.[0] ?? { name: "-", description: null };
      //   return {
      //     ...variant,
      //     name: selectedVariantTranslation?.name ?? backupVariantTranslation.name,
      //     description: selectedVariantTranslation?.description ?? backupVariantTranslation.description,
      //   };
      // }) ?? [],
    })),
  }));

  return dishesWithVariants;
};
