import React, {useState} from "react";
import {auth} from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async(e)=>{
        e.preventDefault();
        try{
            await signInWithEmailAndPassword(auth,email,password);
            navigate('/');
        } catch (error){
            alert('Error: ' + error.message);
        }
    };

    return(
       <>
       <h5>Login to start!</h5>
       <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' required/>
            <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required/>
            <button type='submit'>Log in</button>
        </form>
       </>
       
        );
};

export default Login;