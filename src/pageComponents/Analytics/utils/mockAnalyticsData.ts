export const generateHourlyRevenue = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM
    return hours.map((hour) => ({
        hour: `${hour}:00`,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
    }));
};

export const generateDailyTrends = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
        day,
        revenue: Math.floor(Math.random() * 50000) + 15000,
        orders: Math.floor(Math.random() * 150) + 40,
    }));
};

export const generateTopItems = () => [
    { name: "Classic Burger", count: 45, revenue: 54000 },
    { name: "Pasta Carbonara", count: 32, revenue: 44800 },
    { name: "Caesar Salad", count: 28, revenue: 23800 },
    { name: "Tiramisu", count: 25, revenue: 22500 },
    { name: "Coca Cola", count: 60, revenue: 18000 },
];

export const generateWorstItems = () => [
    { name: "Vegan Meatballs", count: 2, revenue: 3200 },
    { name: "Spicy Tuna Roll", count: 3, revenue: 5400 },
    { name: "Quinoa Salad", count: 4, revenue: 4800 },
];

export const generateGeneralStats = () => ({
    revenueTrend: "up",
    aovTrend: "up",
    repeatRate: "68%",
    peakHour: "19:00",
    qrAdoption: "85%",
    totalRevenue: 1250000, // Monthly
    revenueGrowth: 12,
    avgVisits: 3.2,
    orderAbandonment: "12%",
});

export const PAYMENT_METHODS = [
    { name: "Card", value: 65, color: "#3b82f6" },
    { name: "Cash", value: 15, color: "#22c55e" },
    { name: "Wallet", value: 20, color: "#a855f7" },
];

export const CHANNELS = [
    { name: "QR Menu", value: 70, color: "#3b82f6" },
    { name: "Waiter", value: 20, color: "#f97316" },
    { name: "Counter", value: 10, color: "#64748b" },
];
