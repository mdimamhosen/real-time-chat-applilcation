import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./Firebase";
import { useUserStore } from "./UserStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: async (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;
    //check if current user is blocked
    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId: chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    //check if receiver is blocked
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId: chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId: chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
}));
