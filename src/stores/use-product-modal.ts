import { create } from "zustand";
import { Product, ProductNote } from "@/generated/prisma/client";

export type ProductModalData = Product & {
  productNotes?: ProductNote[];
};

interface ProductModalStore {
  isOpen: boolean;
  data?: ProductModalData;
  onOpen: (data?: ProductModalData) => void;
  onClose: () => void;
}

export const useProductModal = create<ProductModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
