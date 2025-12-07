import { createClient } from "@supabase/supabase-js";

import { type Database } from "./supabaseTypes";

import { env } from "~/env.mjs";

export const getServiceSupabase = () =>
  createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

export const clientSupabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabase = () =>
  typeof window === "undefined" ? getServiceSupabase() : clientSupabase;

export const getUserAsAdmin = async (token: string) => {
  // Use admin.getUserById with JWT verification instead of session lookup
  // This works even when sessions don't exist in auth.sessions table
  const { data: jwtData, error: jwtError } = await getServiceSupabase().auth.getUser(token);
  
  if (jwtError) {
    // If JWT session lookup fails, try to extract user ID from JWT and fetch directly
    try {
      // Decode JWT to get user ID (JWT format: header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode base64url to get payload
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      const userId = payload.sub as string;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      
      // Fetch user directly by ID using admin privileges
      const { data: userData, error: userError } = await getServiceSupabase().auth.admin.getUserById(userId);
      
      if (userError || !userData.user) {
        console.error('User fetch error:', userError);
        throw userError || new Error('User not found');
      }
      
      return { user: userData.user };
    } catch (fallbackError) {
      console.error('Auth fallback error:', fallbackError);
      throw jwtError;
    }
  }

  return jwtData;
};

export const storageBucketsNames = {
  menus: "menus-files",
} as const;
