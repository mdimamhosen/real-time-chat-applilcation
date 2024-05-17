import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./Firebase";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchCurrentUser: async (uid) => {
    if (!uid) {
      return set({ currentUser: null, isLoading: false });
    }
    try {
      const docRef = doc(db, "users", uid);
      const docSpan = await getDoc(docRef);
      if (docSpan.exists()) {
        set({ currentUser: docSpan.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      return set({ currentUser: null, isLoading: false });
    }
  },
}));
