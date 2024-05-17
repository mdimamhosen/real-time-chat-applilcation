import React from "react";
import "./details.css";
import { auth, db } from "../Lib/Firebase";
import { signOut } from "firebase/auth";
import { useChatStore } from "../Lib/ChatStore";
import { useUserStore } from "../Lib/UserStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Details = () => {
  const Logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  };
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();
  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log("An error occurred");
    }
  };
  return (
    <div className="details px-2 h-full  ">
      <div className="user flex flex-col justify-center items-center text-center border-b border-b-[#dddddd35] pb-3 mb-3">
        <img
          src={user.avatar || "./avatar.png"}
          alt=""
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="text flex flex-col">
          <span className="font-bold">{user?.username.toUpperCase()}</span>
          <p className="text-sm text-gray-200">{user?.email}</p>
        </div>
      </div>
      <div className="info flex flex-col  gap-2   h-[30%]  ">
        <div className="option">
          <div className="title">
            <span>Chat Setting</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privecy & Help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" alt="" />
                <span>Photo-224.png</span>
              </div>{" "}
              <img className="download" src="./download.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 py-5">
        <button
          onClick={handleBlock}
          className="bg-red-700 py-2 border  text-black font-bold w-full"
        >
          {isCurrentUserBlocked
            ? "You are blocked"
            : isReceiverBlocked
            ? "User is blocked"
            : " Block This User"}
        </button>
        <button
          onClick={() => auth.signOut()}
          className="bg-blue-500 py-2 border  text-black font-bold"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Details;
