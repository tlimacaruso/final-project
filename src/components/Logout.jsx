import React from "react";
import { Navigate } from "react-router-dom";
import {auth, db} from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';

 export default function LogoutButton() {
    const navigate = useNavigate();
  
    const handleLogout = () => {
      signOut(auth).then(() => {
        navigate('/');
      });
    };
    return (<button onClick={handleLogout}>Logout</button>);
  }