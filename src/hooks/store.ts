import { create } from "zustand";

interface AppState {
  progress: number;
  setProgress: (value: number) => void;

  formSubmitted: boolean;
  setFormSubmitted: (value: boolean) => void;
  resetFormSubmitted: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  progress: 0,
  setProgress: (value) => set({ progress: value }),

  formSubmitted: false,
  setFormSubmitted: (value) => set({ formSubmitted: value }),
  resetFormSubmitted: () => set({ formSubmitted: false }),
}));
