import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { menuValidationSchema } from "~/components/MenuForm/MenuForm.schema";
import { addCategoryValidationSchema } from "~/pageComponents/MenuCreator/molecules/CategoryForm/CategoryForm.schema";
import { addDishValidationSchema } from "~/pageComponents/MenuCreator/molecules/DishForm/DishForm.schema";
import { socialMediaValidationSchema } from "~/pageComponents/RestaurantDashboard/molecules/SocialMediaHandles/SocialMediaHandles.schema";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  generateBackgroundImagePath,
  generateDishImagePath,
  generateMenuImagePath,
} from "~/server/supabase/storagePaths";
import {
  storageBucketsNames,
  supabase,
} from "~/server/supabase/supabaseClient";
import { asOptionalField } from "~/utils/utils";

const prepareTextForSlug = (text: string) => {
  return text.replace(/\s+/g, "-").toLowerCase();
};

const generateMenuSlug = ({ name, city }: { name: string; city: string }) => {
  const randomNumber = Math.random().toString().slice(2, 5);
  return `${prepareTextForSlug(name)}-${prepareTextForSlug(
    city,
  )}-${randomNumber}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
};

const getFullMenu = async (slug: string, db: PrismaClient) =>
  db.menus.findFirst({
    where: {
      slug,
    },
    select: {
      name: true,
      slug: true,
      address: true,
      city: true,
      contactNumber: true,
      id: true,
      isPublished: true,
      logoImageUrl: true,
      backgroundImageUrl: true,
      dishes: {
        select: {
          id: true,
          menuId: true,
          categoryId: true,
          name: true,
          description: true,
          price: true,
          categories: {
            select: {
              id: true,
              name: true,
              sortOrder: true,
            },
          },
          pictureUrl: true,
          // dishVariants: true, // <-- Commented out
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

export const menusRouter = createTRPCRouter({
  getMenus: privateProcedure.query(({ ctx }) => {
    return ctx.db.menus.findMany({
      where: {
        userId: ctx.user.id,
      },
    });
  }),

  getDishesByCategory: privateProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const menu = await ctx.db.menus.findFirst({
        where: { slug: input.slug, userId: ctx.user.id },
      });

      if (!menu) throw new TRPCError({ code: "NOT_FOUND", message: "Menu not found" });

      return ctx.db.categories.findMany({
        where: { menuId: menu.id },
        include: { dishes: true },
        orderBy: { sortOrder: "asc" },
      });
    }),

  upsertMenu: privateProcedure
    .input(menuValidationSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.menus.upsert({
        where: {
          id: input.id || "00000000-0000-0000-0000-000000000000",
        },
        create: {
          name: input.name,
          address: input.address,
          city: input.city,
          slug: generateMenuSlug({
            name: input.name,
            city: input.city,
          }),
          userId: ctx.user.id,
          contactNumber: input.contactPhoneNumber,
          isPublished: false,
        },
        update: {
          name: input.name,
          address: input.address,
          city: input.city,
          slug: generateMenuSlug({
            name: input.name,
            city: input.city,
          }),
          contactNumber: input.contactPhoneNumber,
        },
      });
    }),
  updateMenuBackgroundImg: privateProcedure
    .input(
      z.object({
        menuId: z.string(),
        backgroundImageUrl: asOptionalField(z.string().url()).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.backgroundImageUrl === null) {
        await supabase().storage.from(storageBucketsNames.menus).remove([
          generateBackgroundImagePath({ menuId: input.menuId, userId: ctx.user.id }),
        ]);
        return ctx.db.menus.update({
          where: { id: input.menuId, userId: ctx.user.id },
          data: { backgroundImageUrl: null },
        });
      }

      return ctx.db.menus.update({
        where: { 
          id: input.menuId, 
          userId: ctx.user.id,
        },
        data: { 
          backgroundImageUrl: input.backgroundImageUrl,
        },
      });
    }),
  updateMenuLogoImg: privateProcedure
    .input(
      z.object({
        menuId: z.string(),
        logoImgUrl: asOptionalField(z.string().url()).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.logoImgUrl === null) {
        await supabase().storage.from(storageBucketsNames.menus).remove([
          generateMenuImagePath({ menuId: input.menuId, userId: ctx.user.id }),
        ]);
        return ctx.db.menus.update({
          where: { id: input.menuId, userId: ctx.user.id },
          data: { logoImageUrl: null },
        });
      }

      return ctx.db.menus.update({
        where: { 
          id: input.menuId, 
          userId: ctx.user.id,
         },
        data: { 
          logoImageUrl: input.logoImgUrl,
         },
      });
    }),
  getMenuBySlug: privateProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const menu = await ctx.db.menus.findFirst({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          address: true,
          contactNumber: true,
          isPublished: true,
          logoImageUrl: true,
          backgroundImageUrl: true,
          categories: { select: { id: true, name: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
          dishes: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              categoryId: true,
              pictureUrl: true,
              // dishesTranslation: true, // <-- Commented out
              // dishVariants: true, // <-- Commented out
            },
          },
        },
      });

      if (!menu) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu not found" });
      }

      return menu;
    }),
  getPublicMenuBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const menu = await getFullMenu(input.slug, ctx.db);

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      return menu;
    }),

  upsertDish: privateProcedure
    .input(addDishValidationSchema.extend({ menuId: z.string() }))
    .mutation(({ ctx, input }) => {
      const dishData = {
          name: input.name,
          description: input.description ?? null,
          price: input.price * 100,
          categoryId: input.categoryId && input.categoryId.trim() ? input.categoryId : null,
          menuId: input.menuId,
      };

      if (input.id) {
          return ctx.db.dishes.update({
              where: { id: input.id },
              data: dishData,
          });
      } else {
          return ctx.db.dishes.create({
              data: {
                  ...dishData,
              },
          });
      }
    }),
  updateDishImageUrl: privateProcedure
    .input(
      z.object({
        dishId: z.string(),
        imageUrl: asOptionalField(z.string().url()).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.imageUrl === null) {
        await supabase().storage.from(storageBucketsNames.menus).remove([
          generateDishImagePath({ dishId: input.dishId, userId: ctx.user.id }),
        ]);
        return ctx.db.dishes.update({
          where: { id: input.dishId },
          data: { pictureUrl: null },
        });
      }

      return ctx.db.dishes.update({
        where: { 
          id: input.dishId,
         },
        data: { 
          pictureUrl: input.imageUrl,
         },
      });
    }),

  upsertCategory: privateProcedure
    .input(addCategoryValidationSchema.extend({ menuId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.categories.upsert({
        where: {
          id: input.id || "00000000-0000-0000-0000-000000000000",
        },
        create: {
          name: input.name,
          menuId: input.menuId,
        },
        update: {
          name: input.name,
        },
      });
    }),
  getCategoriesBySlug: privateProcedure
    .input(z.object({ menuSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const menu = await ctx.db.menus.findFirst({
        where: {
          slug: input.menuSlug,
          userId: ctx.user.id,
        },
        select: {
          id: true,
        },
      });

      if (!menu) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Menu not found" });
      }

      return ctx.db.categories.findMany({
        where: {
          menuId: menu.id,
        },
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });
    }),
  deleteCategory: privateProcedure
    .input(z.object({ categoryId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.categories.delete({
        where: {
          id: input.categoryId,
        },
      });
    }),
  deleteDish: privateProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.dishes.delete({
        where: {
          id: input.dishId,
        },
      });
    }),

  deleteMenu: privateProcedure
    .input(z.object({ menuId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.menus.delete({
        where: {
          id: input.menuId,
          userId: ctx.user.id,
        },
      });
    }),
  publishMenu: privateProcedure
    .input(z.object({ menuId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.menus.update({
        where: { 
          id: input.menuId,
        },
        data: {
          isPublished: true,
        },
      });
    }),
  unpublishMenu: privateProcedure
    .input(z.object({ menuId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.menus.update({
        where: { 
          id: input.menuId,
         },
        data: {
          isPublished: false,
        },
      });
    }),

  // --- Dish Variants (Commented Out) ---
  // upsertDishVariant: privateProcedure
  //   .input(
  //     z.object({
  //       id: z.string().optional(),
  //       dishId: z.string(),
  //       price: z.number(),
  //       translatedVariant: z.array(
  //         z.object({ language: z.string(), name: z.string(), description: z.string().optional() }),
  //       ),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { id, dishId, price, translatedVariant } = input;
  //     const defaultTranslation = translatedVariant[0];
  //     if (!id) {
  //       return ctx.db.dishVariant.create({
  //         data: { dishId, price, name: defaultTranslation?.name ?? "Default Name" },
  //       });
  //     }
  //     return ctx.db.dishVariant.update({
  //       where: { id },
  //       data: { price, name: defaultTranslation?.name ?? "Default Name" },
  //     });
  //   }),
});