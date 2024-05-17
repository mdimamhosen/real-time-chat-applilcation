import React, { useEffect, useState } from "react";
import "./Chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../Lib/Firebase";
import { useChatStore } from "../Lib/ChatStore";
import { useUserStore } from "../Lib/UserStore";
import Upload from "../Lib/Upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleEmojiClick = (event) => {
    setText((prev) => prev + event.emoji);
    setOpen(false);
  };

  const endRef = React.useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;
    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await Upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        message: arrayUnion({
          senderId: currentUser.id,
          text: text,
          createAt: new Date().getTime(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
      console.log(chat);
      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (ID) => {
        const userChatRef = doc(db, "userChats", ID);
        const userChatSnap = await getDoc(userChatRef);

        if (userChatSnap.exists()) {
          const userChatData = userChatSnap.data();
          const chatIndex = userChatData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].updatedAt = new Date().getTime();
          userChatData.chats[chatIndex].isSeen =
            ID === currentUser.id ? true : false;

          await updateDoc(userChatRef, {
            chats: userChatData.chats.sort((a, b) => b.updatedAt - a.updatedAt),
          });
        }
      });

      setText("");
    } catch (error) {
      console.log(error);
    }
    setImg({ file: null, url: "" });
  };

  return (
    <div className="chat  flex flex-col  relative  border-l border-r  border-l-[#dddddd35] border-r-[#dddddd35] px-2">
      <div className="top py-5 flex items-center justify-between border-b border-b-[#dddddd35]">
        <div className="user flex items-center gap-2">
          <img
            src={user.avatar || "./avatar.png"}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="text flex flex-col ">
            <span className="font-bold">{user.username}</span>
            <p className="text-sm text-gray-200">{user.bio}</p>
          </div>
        </div>
        <div className="icons flex gap-2 ">
          <img src="./phone.png" alt="" className="  cursor-pointer  w-2 h-2" />
          <img src="./video.png" alt="" className="  cursor-pointer  w-2 h-2" />
          <img src="./info.png" alt="" className="  cursor-pointer  w-2 h-2" />
        </div>
      </div>
      <div className="center   mb-14 flex-1 overflow-y-scroll  ">
        {chat?.message?.map((msg) => (
          <div
            className={
              msg.senderId === currentUser.id
                ? "message own flex flex-col gap-1 "
                : "message   flex flex-col gap-1 "
            }
            key={msg.createAt}
          >
            {msg.img && (
              <img
                src={msg.img}
                alt=""
                className="  cursor-pointer h-[300px] object-cover w-[100%] rounded-lg"
              />
            )}
            <div className="texts flex flex-col gap-2">
              <p className="bg-blue-600 p-2 rounded-md">{msg.text}</p>{" "}
              <span>{msg?.updatedAt}</span>
            </div>{" "}
          </div>
        ))}
        {img.url && (
          <div className={"message own"}>
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom mt-5 absolute bottom-0 bg-gray-600  inset-x-0 px-2 pb-2  pt-4 flex items-center justify-between border-t border-t-[#dddddd35]">
        <div className="icons flex gap-3 ">
          <label htmlFor="file">
            <img src="./img.png" alt="" className="  cursor-pointer  w-2 h-2" />
          </label>
          <input
            type="file"
            id="file"
            name="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          {/* <img
            src="./camera.png"
            alt=""
            className="  cursor-pointer  w-2 h-2"
          />
          <img src="./mic.png" alt="" className="  cursor-pointer  w-2 h-2" /> */}
        </div>
        <input
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          value={text}
          type="text"
          placeholder="Type a message..."
          className="w-[70%] bg-[rgba(17,25,40,.5)] border-none outline-none text-white p-2 rounded-lg"
        />

        <div className="relative">
          <img
            src="./emoji.png"
            alt=""
            className="  cursor-pointer   w-6 h-6"
            onClick={() => setOpen(!open)}
          />
          <div className="picker absolute bottom-8 left-0">
            <EmojiPicker open={open} onEmojiClick={handleEmojiClick} />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="bg-blue-400 text-white rounded-md border-0 font-bold p-2"
        >
          {isCurrentUserBlocked || isReceiverBlocked ? "Blocked" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
