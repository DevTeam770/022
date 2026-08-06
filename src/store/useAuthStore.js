import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: "guest",

      login: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
          role: userData.role || "customer",
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: "guest",
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
