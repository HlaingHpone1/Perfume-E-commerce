import { create } from "zustand";
import { Scent, Attachment } from "@/generated/prisma/client";

type ScentWithImage = Scent & { attachments?: Attachment[] };

interface ScentModalStore {
  isOpen: boolean;
  data?: ScentWithImage;
  onOpen: (data?: ScentWithImage) => void;
  onClose: () => void;
}

export const useScentModal = create<ScentModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
