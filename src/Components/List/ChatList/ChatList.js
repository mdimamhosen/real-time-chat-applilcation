import React, { useEffect, useState } from "react";
import "./ChatList.css";
import AddUser from "../../AddUser/AddUser";
import { useUserStore } from "../../Lib/UserStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../Lib/Firebase";
import { get } from "firebase/database";
import { useChatStore } from "../../Lib/ChatStore";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        if (res.exists()) {
          const items = res.data().chats || [];
          const promises = items.map(async (item) => {
            const docRef = doc(db, "users", item.receiverId);
            const docSnap = await getDoc(docRef);
            const user = docSnap.exists() ? docSnap.data() : null;
            return { ...item, user };
          });
          const chatData = await Promise.all(promises);
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          console.log("Document does not exist");
          setChats([]);
        }
      }
    );
    return unsubscribe;
  }, [currentUser.id]);

  const handleChatClick = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userChats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats.sort((a, b) => b.updatedAt - a.updatedAt),
      });

      changeChat(chat.chatId, chat.user);
    } catch (error) {}
  };
  const filteredChats = chats.filter((chat) => {
    return chat.user.username.toLowerCase().includes(input.toLowerCase());
  });
  return (
    <div className="chatlist   ">
      <div className="search   flex justify-between">
        <div className="searchBar   w-[80%]">
          <img src="./search.png" alt="" className="w-6 h-6" />
          <input
            type="text"
            placeholder="Search"
            className="  "
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="w-[20%] ">
          <img
            src={addMode ? "./minus.png" : "./plus.png"}
            alt=""
            onClick={() => setAddMode(!addMode)}
            className="w-8 h-8 bg-[rgba(17,25,40,0.5)] rounded-lg p-1 cursor-pointer"
          />
        </div>
      </div>

      {filteredChats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => handleChatClick(chat)}
          style={{
            background: chat?.isSeen ? "transparent" : "#5183fe",
          }}
          className="item flex items-center gap-4 cursor-pointer py-5 border-b border-b-[#dddddd35]"
        >
          <img
            src={chat.user.avatar || "./avatar.png"}
            className="w-14 h-14 rounded-full object-cover  "
            alt=""
          />
          <div className="texts flex flex-col gap-1.5">
            <span className="font-bold capitalize">{chat.user.username}</span>
            <p className="text-sm capitalize">{chat.lastMessage || "..."}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
