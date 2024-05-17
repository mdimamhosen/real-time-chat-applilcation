import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdy0o9UrmMUMPz5GOm1nmJiJGF55CVFQU",
  authDomain: "real-time-chat-applicati-777e5.firebaseapp.com",
  projectId: "real-time-chat-applicati-777e5",
  storageBucket: "real-time-chat-applicati-777e5.appspot.com",
  messagingSenderId: "256077790710",
  appId: "1:256077790710:web:4271ec7eb65587d4359bd7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
