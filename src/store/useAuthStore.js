import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: "guest",

      login: (userData) =>
        set({
          user: userData,
          isAuthenticated: true,
          role: userData.role || "customer",
        }),

      logout: () =>
        set({
          user: null,
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
