import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProfileStore = create(
  persist(
    (set, get) => ({
      profile: {
        fullName: "",
        department: "",
        phone: "",
        shortcuts: [],
      },

      setProfile: (profile) => set({ profile: { ...get().profile, ...profile } }),

      updateName: (fullName) =>
        set((state) => ({ profile: { ...state.profile, fullName } })),

      addShortcut: (shortcut) =>
        set((state) => ({
          profile: {
            ...state.profile,
            shortcuts: [...state.profile.shortcuts, shortcut],
          },
        })),

      updateShortcut: (index, shortcut) =>
        set((state) => {
          const shortcuts = [...state.profile.shortcuts];
          shortcuts[index] = shortcut;
          return { profile: { ...state.profile, shortcuts } };
        }),

      deleteShortcut: (index) =>
        set((state) => {
          const shortcuts = state.profile.shortcuts.filter((_, i) => i !== index);
          return { profile: { ...state.profile, shortcuts } };
        }),
    }),
    {
      name: "profile-storage",
    }
  )
);
