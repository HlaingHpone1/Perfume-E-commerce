import { create } from "zustand";
import { Note, Attachment } from "@/generated/prisma/client";

type NoteWithImage = Note & { attachments?: Attachment[] };

interface NoteModalStore {
  isOpen: boolean;
  data?: NoteWithImage;
  onOpen: (data?: NoteWithImage) => void;
  onClose: () => void;
}

export const useNoteModal = create<NoteModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false, data: undefined }),
}));
