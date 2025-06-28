import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; 

const AuthContext = createContext();


export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

   
    const value = {
        currentUser,
        loadingAuth: loading 
    };

    return (
        <AuthContext.Provider value={value}>
           
            {!loading && children}

            {loading && <p>Loading authentication...</p>}
        </AuthContext.Provider>
    );
};