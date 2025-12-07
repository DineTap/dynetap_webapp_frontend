"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  dishId: string;
  name: string;
  price: number; // in cents
  quantity: number;
  pictureUrl?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  // Order session management
  orderNumber: string | null;
  createNewOrder: () => void;
  joinExistingOrder: (orderNumber: string) => void;
  clearOrderSession: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "dynetap_cart";
const ORDER_NUMBER_STORAGE_KEY = "dynetap_order_number";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart and order number from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart) as CartItem[]);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }

    const savedOrderNumber = localStorage.getItem(ORDER_NUMBER_STORAGE_KEY);
    if (savedOrderNumber) {
      setOrderNumber(savedOrderNumber);
    }

    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Save order number to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      if (orderNumber) {
        localStorage.setItem(ORDER_NUMBER_STORAGE_KEY, orderNumber);
      } else {
        localStorage.removeItem(ORDER_NUMBER_STORAGE_KEY);
      }
    }
  }, [orderNumber, isInitialized]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.dishId === item.dishId);
      if (existingItem) {
        return prevItems.map((i) =>
          i.dishId === item.dishId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (dishId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.dishId !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.dishId === dishId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const createNewOrder = () => {
    // Generate 5-digit order number
    const newOrderNumber = Math.floor(10000 + Math.random() * 90000).toString();
    setOrderNumber(newOrderNumber);
  };

  const joinExistingOrder = (orderNum: string) => {
    // Validate 5-digit format
    if (/^\d{5}$/.test(orderNum)) {
      setOrderNumber(orderNum);
    } else {
      throw new Error("Order number must be 5 digits");
    }
  };

  const clearOrderSession = () => {
    setOrderNumber(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        orderNumber,
        createNewOrder,
        joinExistingOrder,
        clearOrderSession,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
