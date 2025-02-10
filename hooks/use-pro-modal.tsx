import { create } from 'zustand';

interface UseProModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useProModal = create<UseProModalStore>(set => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false })
}));
