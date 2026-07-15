import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: any | null;
  setUser: (user: any | null) => void;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
  habits: any[];
  setHabits: (habits: any[]) => void;
}

export const useStore = create<AppState>((set) => ({
  isDarkMode: true, // Defaulting to dark mode as seen in the mockup mostly
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  user: null,
  setUser: (user) => set({ user }),
  isAuthReady: false,
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  habits: [],
  setHabits: (habits) => set({ habits }),
}));
