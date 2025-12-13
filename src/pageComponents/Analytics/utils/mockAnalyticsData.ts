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

export const generateMenuIntelligence = () => [
    { name: "Truffle Burger", revenue: 15400, profit: 9800, trend: "up", aov_boost: true },
    { name: "Lobster Mac", revenue: 12200, profit: 4500, trend: "down", aov_boost: false },
    { name: "House Fries", revenue: 8600, profit: 7200, trend: "stable", aov_boost: true },
    { name: "Craft Beer Flight", revenue: 9500, profit: 6000, trend: "up", aov_boost: true },
    { name: "Vegan Slider", revenue: 3200, profit: 800, trend: "down", aov_boost: false },
];

export const generateChannelPerformance = () => ({
    channels: [
        { name: "QR Menu", revenue: 45000, orders: 850, aov: 52.9, conversion: "24%" },
        { name: "Waiter", revenue: 28000, orders: 420, aov: 66.6, conversion: "95%" },
        { name: "Counter", revenue: 12000, orders: 380, aov: 31.5, conversion: "15%" },
    ],
});

export const generateTableEfficiency = () => ({
    avgRevPerTable: 1450,
    turnoverTime: "48 min",
    peakUtilization: "85%",
    underperforming: ["Zone B (Patio)", "Table 14", "Table 4"],
});

export const generateOperationalStats = () => ({
    avgPrepTime: 14,
    bottlenecks: ["19:00 - 20:00 (Kitchen)", "13:00 - 14:00 (Bar)"],
    staffingStatus: "Optimal",
    refundRate: "0.8%",
});

export const generateCustomerExperience = () => ({
    abandonmentRate: "12%",
    paymentDropOff: "4%",
    avgRating: 4.8,
    issues: ["Long wait time", "Cold food", "App glitch"],
});

export const generateFrequentPairs = () => [
    { item1: "Burger", item2: "Fries", count: 145 },
    { item1: "Steak", item2: "Red Wine", count: 82 },
    { item1: "Coffee", item2: "Cheesecake", count: 64 },
    { item1: "Pizza", item2: "Coke", count: 120 },
];

export const generatePrepTimeTrend = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 10); // 10 AM to 10 PM
    return hours.map((h) => ({
        time: `${h}:00`,
        minutes: Math.floor(Math.random() * 15) + 10, // 10-25 mins
    }));
};
