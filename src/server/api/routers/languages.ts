import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { assert } from "~/utils/assert";

export const languagesRouter = createTRPCRouter({
  getLanguages: publicProcedure.query(async ({ ctx }) => {
    return [
      { code: "en", name: "English" },
    ];
  }),
  // getLanguages: publicProcedure.query(async ({ ctx }) => {
  //   return ctx.db.menuLanguages.findMany();
  // }),

  // changeMenuLanguages: privateProcedure
  //   .input(z.object({ languages: z.array(z.string()), menuId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const languages = await ctx.db.menuLanguages.findMany({
  //       where: {
  //         menu: {
  //           id: input.menuId,
  //           userId: ctx.user.id,
  //         },
  //       },
  //     });

  //     const languagesToCreate = input.languages.filter(
  //       (language) => !languages.find((lang) => lang.language === language)
  //     );

  //     const languagesToDelete = languages.filter(
  //       (language) => !input.languages.includes(language.language)
  //     );

  //     const newLanguagesCount =
  //       languages.length - languagesToDelete.length + languagesToCreate.length;

  //     if (newLanguagesCount < 1) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "You cannot delete all languages from menu",
  //       });
  //     }

  //     const currentLanguages = languages.filter(
  //       (lang) =>
  //         !languagesToDelete.some(
  //           (languageToDelete) => languageToDelete.language === lang.language
  //         )
  //     );

  //     const isDefaultLanguageInCurrentLanguages = currentLanguages.some(
  //       (lang) => lang.isDefault
  //     );

  //     const allLanguages = [
  //       ...languagesToCreate,
  //       ...currentLanguages.map((lang) => lang.language),
  //     ];

  //     await ctx.db.$transaction(async (prisma) => {
  //       const deletePromise = prisma.menuLanguages.deleteMany({
  //         where: {
  //           menu: {
  //             id: input.menuId,
  //             userId: ctx.user.id,
  //           },
  //           language: {
  //             in: languagesToDelete.map((lang) => lang.language),
  //           },
  //         },
  //       });

  //       const createPromise = prisma.menuLanguages.createMany({
  //         data: languagesToCreate.map((lang) => ({
  //           menuId: input.menuId,
  //           language: lang,
  //         })),
  //       });

  //       await Promise.all([deletePromise, createPromise]);

  //       if (!isDefaultLanguageInCurrentLanguages) {
  //         const newBaseLanguage = allLanguages[0];
  //         assert(!!newBaseLanguage, "New base language is not defined");

  //         await prisma.menuLanguages.updateMany({
  //           where: {
  //             menuId: input.menuId,
  //             language: newBaseLanguage,
  //           },
  //           data: { isDefault: true },
  //         });
  //       }
  //     });

  //     return true;
  //   }),

  // changeDefaultLanguage: privateProcedure
  //   .input(z.object({ language: z.string(), menuId: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const languages = await ctx.db.menuLanguages.findMany({
  //       where: {
  //         menu: {
  //           id: input.menuId,
  //           userId: ctx.user.id,
  //         },
  //       },
  //     });

  //     const language = languages.find((lang) => lang.language === input.language);

  //     if (!language) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Language is not assigned to this menu",
  //       });
  //     }

  //     const updateDefaultsToFalsePromise = ctx.db.menuLanguages.updateMany({
  //       where: {
  //         menu: {
  //           id: input.menuId,
  //           userId: ctx.user.id,
  //         },
  //       },
  //       data: { isDefault: false },
  //     });

  //     const updateDefaultLanguagePromise = ctx.db.menuLanguages.updateMany({
  //       where: {
  //         menuId: input.menuId,
  //         language: input.language,
  //       },
  //       data: { isDefault: true },
  //     });

  //     await Promise.all([updateDefaultsToFalsePromise, updateDefaultLanguagePromise]);

  //     return true;
  //   }),
});
