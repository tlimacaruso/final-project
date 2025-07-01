import React from "react";
import { useNavigate } from "react-router-dom";
import {auth} from '../firebaseConfig';
import { signOut } from 'firebase/auth';

 export default function LogoutButton() {

  const navigate = useNavigate();
  
    const handleLogout = () => {
      signOut(auth).then(() => {
        navigate('/');
      });
    };
    return (<button className= 'logoutBtn' onClick={handleLogout}>Logout</button>);
  }