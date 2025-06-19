import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,query,orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

const usersCollection = collection(db, "users");

