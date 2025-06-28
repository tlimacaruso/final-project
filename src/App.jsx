import './App.css'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate} from 'react-router-dom';
import {auth, db} from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';


import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import Register from './components/Register';
import Sell from './components/Sell';
import LogoutButton from './components/Logout';
import Details from './components/Details';

function App() {
  const [user, setUser] =useState(null);
  const [userData,setUserData] = useState(null);

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async(currentUser)=>{
      setUser(currentUser);

      if (currentUser){

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()){
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
}, []);



  return (
    
    <Router>
      <div className="NavBar">
        <nav>
          <ul style={{display:'flex', gap: '1rem', listStyle:'none'}}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sell">Sell</Link></li>

            {!user ? (
              <>
              <li><Link to ="/login">Login</Link></li>
              <li><Link to ="/register">Sign up</Link></li>
              </>
            ) : (
              <>
              <li><Link to="/profile">Profile</Link></li>
              <li><LogoutButton/></li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/profile" element={user ? <Profile /> : <Navigate to='/login'/>}/>
          <Route path="/sell" element={user ? <Sell /> : <Navigate to='/login'/>}/>
          <Route path ="/profile/:userId" element={<Profile />} />
          <Route path="/details/:id" element={<Details />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App;