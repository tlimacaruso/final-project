import React, {useState} from "react";
import {auth} from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './Login.css';
import '../App.css';

function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleLogin = async(e)=>{
        e.preventDefault();
        setEmailError('');
        setPasswordError('');
        try{
            await signInWithEmailAndPassword(auth,email,password);
            navigate('/');
        } catch (error){
            if (error.code === 'auth/invalid-email') {
                setEmailError('Oops! Wrong email!');
              } else if (error.code === 'auth/wrong-password') {
                setPasswordError('Oops! Wrong password!');
              } else {
            alert('Error: ' + error.message);
            }
        }
    };

    return(
       <>
       <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <h5>Login to start!</h5>
            <div className="loginForm">
            <div className="loginInput">
            <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' required/>
            <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required/>
            </div>
            <button className='loginBtn' type='submit'>Log in</button>
            </div>
        </form>
       </>
       
        );
};

export default Login;