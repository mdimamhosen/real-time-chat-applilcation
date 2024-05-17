import React, { useRef, useState } from "react";
import "./AddUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../Lib/Firebase";
import { create } from "zustand";
import { useUserStore } from "../Lib/UserStore";
import { toast } from "react-toastify";
const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const handleSearchedUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username } = Object.fromEntries(formData);
    try {
      const userRef = collection(db, "users");
      const qry = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(qry);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {}
  };
  const handleAddUser = async () => {
    if (!user) {
      toast.error("User not found.");
      return;
    }

    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userChats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        message: [],
      });

      const currentUserChatRef = doc(userChatRef, currentUser.id);
      const searchedUserChatRef = doc(userChatRef, user.id);

      await updateDoc(currentUserChatRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: user.id,
          updatedAt: Date.now(),
          lastMessage: "",
        }),
      });

      await updateDoc(searchedUserChatRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: currentUser.id,
          updatedAt: Date.now(),
          lastMessage: "",
        }),
      });

      console.log("User added successfully.");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="adduser">
      <form onSubmit={handleSearchedUser}>
        <input type="text" name="username" placeholder="Username" id="" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
          </div>
          <p>{user.username} </p>{" "}
          <button onClick={handleAddUser}>Add Uses</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
