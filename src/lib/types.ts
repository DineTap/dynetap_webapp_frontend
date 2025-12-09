
// Mock types to replace Prisma generated types

export enum TagType {
    high_protein = "high_protein",
    high_fiber = "high_fiber",
    low_fat = "low_fat",
    low_carb = "low_carb",
    sugar_free = "sugar_free",
    organic = "organic",
    gluten_free = "gluten_free",
    lactose_free = "lactose_free",
    vegetarian = "vegetarian",
    vegan = "vegan",
    keto = "keto",
}

export interface MenuLanguage {
    id: string;
    code: string;
    name: string;
    isDefault: boolean;
}

export interface Menus {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    logoImageUrl: string | null;
    backgroundImageUrl: string | null;
    primaryColor: string;
    isPublished: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
