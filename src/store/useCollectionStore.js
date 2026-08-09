import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useCollectionStore = create(
  persist(
    (set, get) => ({
      groups: [],

      createGroup: (name, description = "") => {
        const group = {
          id: uuidv4(),
          name,
          description,
          items: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ groups: [...state.groups, group] }));
        return group;
      },

      updateGroup: (id, updates) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addItemToGroup: (groupId, item) => {
        const newItem = {
          id: uuidv4(),
          ...item,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, items: [...g.items, newItem] } : g
          ),
        }));
        return newItem;
      },

      updateItem: (groupId, itemId, updates) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  items: g.items.map((i) =>
                    i.id === itemId ? { ...i, ...updates } : i
                  ),
                }
              : g
          ),
        })),

      deleteItem: (groupId, itemId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
              : g
          ),
        })),

      getGroupById: (id) => get().groups.find((g) => g.id === id),
    }),
    {
      name: "collection-storage",
    }
  )
);
