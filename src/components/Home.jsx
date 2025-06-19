import React, {useState, useEffect} from "react";
import {auth} from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Home(){
    return(
        <div>
            <h1>Feed</h1>
        </div>
    );
}

export default Home;