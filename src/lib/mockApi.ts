
// Mock data and API implementation for frontend-only mode
import { useQuery, useMutation } from "@tanstack/react-query";

export interface Dish {
    id: string;
    name: string;
    price: number;
    description: string;
    pictureUrl: string;
    categoryId: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface OrderStatus {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    tableNumber?: string;
    notes?: string;
    items: {
        dishName: string;
        quantity: number;
        priceAtTime: number;
        id?: string;
    }[];
}

export interface Menu {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    isPublished: boolean;
    categories: Category[];
    dishes: Dish[];
    // Additional fields for MenuItem
    logoImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    backgroundImageUrl: string | null;
    primaryColor: string;
    contactNumber: string | null;
    contactEmail: string | null;
}

const mockCategories: Category[] = [
    { id: "cat_1", name: "Starters" },
    { id: "cat_2", name: "Mains" },
    { id: "cat_3", name: "Desserts" },
    { id: "cat_4", name: "Drinks" },
];

const mockDishes: Dish[] = [
    {
        id: "dish_1",
        name: "Classic Burger",
        price: 12000,
        description: "Juicy beef patty with lettuce, tomato, and cheese.",
        pictureUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
        categoryId: "cat_2",
    },
    {
        id: "dish_2",
        name: "Caesar Salad",
        price: 8500,
        description: "Crisp romaine lettuce, parmesan, croutons, and caesar dressing.",
        pictureUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60",
        categoryId: "cat_1",
    },
    {
        id: "dish_3",
        name: "Pasta Carbonara",
        price: 14000,
        description: "Spaghetti with pancetta, egg, and pecorino cheese.",
        pictureUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60",
        categoryId: "cat_2",
    },
    {
        id: "dish_4",
        name: "Tiramisu",
        price: 9000,
        description: "Classic Italian coffee-flavored dessert.",
        pictureUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=60",
        categoryId: "cat_3",
    },
    {
        id: "dish_5",
        name: "Coca Cola",
        price: 3000,
        description: "Cold refreshing soda.",
        pictureUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60",
        categoryId: "cat_4",
    },
];

const mockMenu: Menu = {
    id: "menu_1",
    name: "DineTap Demo Bistro",
    slug: "demo",
    address: "123 Innovation Drive",
    city: "Cape Town",
    isPublished: true,
    categories: mockCategories,
    dishes: mockDishes,
    logoImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user_1",
    backgroundImageUrl: null,
    primaryColor: "#000000",
    contactNumber: "+1234567890",
    contactEmail: "contact@dinetap.com"
};

// Refined Mock Object matching TRPC structure
export const mockApi = {
    menus: {
        getPublicMenuBySlug: Object.assign(
            async (input: { slug: string }) => {
                return mockMenu;
            },
            {
                useQuery: (input: { slug: string }) => useQuery({
                    queryKey: ["activeMenu", input.slug],
                    queryFn: async () => mockMenu,
                    initialData: mockMenu
                })
            }
        ),
        getMenuBySlug: Object.assign(
            async (input: { slug: string }) => {
                return mockMenu;
            },
            {
                useQuery: (input: { slug: string }) => useQuery({
                    queryKey: ["activeMenu", input.slug],
                    queryFn: async () => mockMenu,
                    initialData: mockMenu
                })
            }
        ),
        getMenus: Object.assign(
            async () => {
                return [mockMenu];
            },
            {
                useQuery: () => useQuery({
                    queryKey: ["menus"],
                    queryFn: async () => [mockMenu],
                    initialData: [mockMenu]
                })
            }
        ),
        upsertDish: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Upserting dish:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { id: "dish_new_" + Math.random(), ...data };
                }
            })
        },
        updateDishImageUrl: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Updating dish image:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { success: true };
                }
            })
        },
        getCategoriesBySlug: {
            useQuery: (input: { menuSlug: string }) => useQuery({
                queryKey: ["categories", input.menuSlug],
                queryFn: async () => [
                    { id: "cat_1", name: "Starters" },
                    { id: "cat_2", name: "Mains" },
                    { id: "cat_3", name: "Desserts" },
                    { id: "cat_4", name: "Drinks" }
                ],
                initialData: [
                    { id: "cat_1", name: "Starters" },
                    { id: "cat_2", name: "Mains" },
                    { id: "cat_3", name: "Desserts" },
                    { id: "cat_4", name: "Drinks" }
                ]
            })
        },
        deleteDish: {
            useMutation: () => useMutation({
                mutationFn: async (input: { dishId: string }) => {
                    console.log("Deleting dish:", input.dishId);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { success: true };
                }
            })
        },
        deleteMenu: {
            useMutation: () => useMutation({
                mutationFn: async (input: { menuId: string }) => {
                    console.log("Deleting menu:", input.menuId);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { success: true };
                }
            })
        },
        publishMenu: {
            useMutation: () => useMutation({
                mutationFn: async (input: { menuId: string }) => {
                    console.log("Publishing menu:", input.menuId);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    mockMenu.isPublished = true;
                    return { success: true };
                }
            })
        },
        unpublishMenu: {
            useMutation: () => useMutation({
                mutationFn: async (input: { menuId: string }) => {
                    console.log("Unpublishing menu:", input.menuId);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    mockMenu.isPublished = false;
                    return { success: true };
                }
            })
        },
        upsertCategory: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Upserting category:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { id: "cat_" + Math.random(), ...data };
                }
            })
        },
        upsertMenu: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Upserting menu:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { slug: "demo", ...data };
                }
            })
        }
    },
    checkout: {
        initiateCheckout: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Mock checkout: ", data);
                    return { redirectUrl: window.location.href, success: true };
                }
            })
        },
        updateOrderStatus: {
            useMutation: (options?: any) => useMutation({
                mutationFn: async (data: { orderId: string, newStatus: string }) => {
                    console.log("Updating order status:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { success: true };
                },
                ...options
            })
        },
        getOrderStatus: {
            useQuery: (input: { orderNumber: string }, options?: any) => useQuery<OrderStatus>({
                queryKey: ["orderStatus", input.orderNumber],
                queryFn: async () => ({
                    id: "order_1",
                    status: "preparing",
                    totalPrice: 24500,
                    createdAt: new Date().toISOString(),
                    customerName: "John Doe",
                    customerEmail: "john@example.com",
                    customerPhone: "1234567890",
                    tableNumber: "5",
                    notes: "No onions",
                    items: [
                        { dishName: "Classic Burger", quantity: 2, priceAtTime: 12000, id: "item_1" },
                        { dishName: "Coca Cola", quantity: 2, priceAtTime: 3000, id: "item_2" }
                    ]
                }),
                initialData: {
                    id: "order_1",
                    status: "preparing",
                    totalPrice: 24500,
                    createdAt: new Date().toISOString(),
                    customerName: "John Doe",
                    customerEmail: "john@example.com",
                    customerPhone: "1234567890",
                    tableNumber: "5",
                    notes: "No onions",
                    items: [
                        { dishName: "Classic Burger", quantity: 2, priceAtTime: 12000, id: "item_1" },
                        { dishName: "Coca Cola", quantity: 2, priceAtTime: 3000, id: "item_2" }
                    ]
                },
                ...options
            })
        },
        getOrdersByMenu: {
            useQuery: (input: { menuId: string }, options?: any) => useQuery<{ orders: OrderStatus[] }>({
                queryKey: ["orders", input.menuId],
                queryFn: async () => ({
                    orders: [
                        {
                            id: "order_1",
                            status: "pending",
                            totalPrice: 24500,
                            createdAt: new Date().toISOString(),
                            customerName: "John Doe",
                            items: [
                                { dishName: "Classic Burger", quantity: 2, priceAtTime: 12000 },
                                { dishName: "Coca Cola", quantity: 2, priceAtTime: 3000 }
                            ]
                        },
                        {
                            id: "order_2",
                            status: "preparing",
                            totalPrice: 14000,
                            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                            customerName: "Jane Smith",
                            items: [
                                { dishName: "Pasta Carbonara", quantity: 1, priceAtTime: 14000 }
                            ]
                        },
                        {
                            id: "order_3",
                            status: "served",
                            totalPrice: 17000,
                            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                            customerName: "Mike Johnson",
                            items: [
                                { dishName: "Caesar Salad", quantity: 2, priceAtTime: 8500 }
                            ]
                        }
                    ]
                }),
                initialData: { orders: [] },
                ...options
            })
        }
    },

    payments: {
        getSubscriptionInfo: {
            useQuery: () => useQuery({
                queryKey: ["subscription"],
                queryFn: async () => ({
                    status: "active",
                    isSubscribed: true,
                    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updatePaymentUrl: "#",
                }),
                initialData: {
                    status: "active",
                    isSubscribed: true,
                    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updatePaymentUrl: "#",
                }
            })
        },
        createPremiumCheckout: {
            useMutation: () => useMutation({
                mutationFn: async (data: any) => {
                    console.log("Mock premium checkout:", data);
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return "https://mock-checkout.com";
                }
            })
        },
        getCustomerPortalUrl: {
            useQuery: (input?: any, options?: any) => useQuery<string>({
                queryKey: ["customerPortal"],
                queryFn: async () => "https://mock-portal.com",
                initialData: "https://mock-portal.com",
                ...options
            })
        },
        cancelSubscription: {
            useMutation: (options?: any) => useMutation({
                mutationFn: async () => {
                    console.log("Mock cancel subscription");
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return { success: true };
                },
                ...options
            })
        }
    },
    auth: {
        getProfile: {
            useQuery: () => useQuery({
                queryKey: ["profile"],
                queryFn: async () => {
                    const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem("isLoggedIn") !== "false" : true;
                    if (!isLoggedIn) return null;
                    return {
                        id: "mock_user",
                        fullName: "Demo User",
                        email: "demo@dynetap.com"
                    }
                },
                initialData: typeof window !== 'undefined' && localStorage.getItem("isLoggedIn") === "false" ? null : {
                    id: "mock_user",
                    fullName: "Demo User",
                    email: "demo@dynetap.com"
                }
            })
        },
        logout: {
            useMutation: () => useMutation({
                mutationFn: async () => {
                    localStorage.setItem("isLoggedIn", "false");
                    window.location.href = "/";
                }
            })
        }
    },
    useContext: () => ({
        menus: {
            invalidate: async () => {
                console.log("Invalidating menus...");
            }
        }
    })
};
