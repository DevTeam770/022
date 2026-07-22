import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useTicketStore = create(
  persist(
    (set, get) => ({
      tickets: [],

      addTicket: (ticket) => {
        const newTicket = {
          id: uuidv4(),
          ...ticket,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tickets: [newTicket, ...state.tickets] }));
        return newTicket;
      },

      updateTicket: (id, updates) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        })),

      getTicketById: (id) => get().tickets.find((t) => t.id === id),

      getTicketsByUser: (email) =>
        get().tickets.filter((t) => t.createdBy === email),
    }),
    {
      name: "ticket-storage",
    }
  )
);
