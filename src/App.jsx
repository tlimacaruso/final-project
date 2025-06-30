import './App.css'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import Register from './components/Register';
import Sell from './components/Sell';
import LogoutButton from './components/Logout';
import Details from './components/Details';
import WishlistPage from './components/Wishlistpage';
import Logo from '../public/img/reclotheslogo.png';
import WishlistNavBar from './components/WishlistNavBar';
import CheckoutPage from './components/CheckoutPage';
import Footer from './components/Footer';
import { SearchResultsPage, UsersResultsPage, ItemsResultsPage } from './components/SearchResultsPage';



function App() {

  const PrivateRoute = ({ children }) => {
    const { currentUser, loadingAuth } = useAuth();

    if (loadingAuth) {
      return <p>Loading authentication...</p>;
    }
    return currentUser ? children : <Navigate to="/login" replace />;
  };

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

/*   const { resetTimeout } = useAuthTimeout(currentUser, 60 * 60 * 1000); */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
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

 /*  const handleRenewSession = () => {
    resetTimeout();
    console.log('Sessão renovada manualmente');
  };

 */
  const { currentUser } = useAuth();


  return (

    <Router>
      <div className="NavBar">
        <nav>
          <Link to='/' className='navbar-logo'>
            <img src={Logo} alt='Logo' style={{ height: '100px' }} />
          </Link>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sell">Sell</Link></li>

            {!currentUser ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Sign up</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/profile">Profile</Link></li>
                <li><LogoutButton /></li>
              </>
            )}
          </ul>
          <ul>
            <li>
              {currentUser && (
                <li><WishlistNavBar className='wishButton' /></li>
              )}
            </li>
          </ul>
        </nav>
        <main className='main-content'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:searchTerm" element={<SearchResultsPage />} />
            <Route path="/search/:searchTerm/users" element={<UsersResultsPage />} />
            <Route path="/search/:searchTerm/items" element={<ItemsResultsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private routes */}
            <Route path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>}
            />
            <Route path="/profile/:userId"
              element={<Profile />} />

            <Route path="/sell" element={
              <PrivateRoute>
                <Sell />
              </PrivateRoute>} />

            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/details/:id" element={<Details />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />

            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <WishlistPage />
                </PrivateRoute>
              }
            />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App;