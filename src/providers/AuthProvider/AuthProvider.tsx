"use client";

import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Mock types to match Supabase structure roughly or just what's used
interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
  access_token: string;
}

export const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}>({
  user: null,
  session: null,
  isLoading: false,
});

const MOCK_USER: User = {
  id: "mock_user_id",
  email: "demo@dynetap.com"
};

const MOCK_SESSION: Session = {
  user: MOCK_USER,
  access_token: "mock_token"
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Check localStorage for mock auth state
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") !== "false";
    if (isLoggedIn) {
      setUserSession(MOCK_SESSION);
      setUser(MOCK_USER);
    } else {
      setUserSession(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const value = {
    session: userSession,
    user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ReactQueryDevtools />
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a AuthContextProvider.");
  }

  return context;
};
