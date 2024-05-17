// Login.js
import React, { useState } from "react";
import "./LogIn.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../Lib/Firebase";
import { doc, setDoc } from "firebase/firestore";
import Upload from "../Lib/Upload";

const LogIn = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      e.target.reset();
    } catch (error) {
      toast.error("An error occurred while logging in.");
      console.error(error);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password, file } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await Upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        username: username,
        email: email,
        id: res.user.uid,
        blocked: [],
        avatar: imgUrl,
      });
      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created successfully! You can now login.");
      e.target.reset();
      setAvatar({ file: null, url: "" });
    } catch (error) {
      toast.error("An error occurred while creating the account.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item w-full h-full">
        <h1 className="font-bold text-4xl">Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <input type="email" name="email" id="email" placeholder="Email" />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
          />
          <button disabled={loading} type="submit">
            {loading ? "Loading" : "Sign In"}
          </button>
        </form>
      </div>

      <div className="separator w-[1px] bg-blue-300 h-[80%]"></div>

      <div className="item w-full h-full">
        <h1 className="font-bold text-4xl">Create Account</h1>
        <form onSubmit={handleSignUp}>
          <label htmlFor="file">
            Upload an image
            <img alt="" src={avatar.url || "./avatar.png"} />
          </label>
          <input
            type="file"
            name="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <input
            type="text"
            name="username"
            required
            id="username"
            placeholder="Username"
          />
          <input type="email" name="email" id="email" placeholder="Email" />
          <input
            type="password"
            name="password"
            required
            id="password"
            placeholder="Password"
          />
          <button disabled={loading} type="submit">
            {loading ? "Loading" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
