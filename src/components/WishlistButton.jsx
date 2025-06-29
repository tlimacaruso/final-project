import React, { useState, useEffect } from 'react';
import { addProductToWishlist, removeFromWishlist, getUserWishlist } from './WishlistService';
import { auth } from '../firebaseConfig';

const WishlistButton = ({ itemId, itemOwnerId }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const checkIfWishlisted = async () => {
            if (currentUser && itemId) {
                const wishlist = await getUserWishlist(currentUser.uid);
                setIsWishlisted(wishlist.includes(itemId));
            } else {
                setIsWishlisted(false);
            }
        };
        checkIfWishlisted();
    }, [currentUser, itemId]);

    const handleWishlistToggle = async () => {
        if (!currentUser) {
            alert("Please log in to manage your wishlist.");
            return;
        }

        if (currentUser.uid === itemOwnerId) {
            alert("You cannot add your own item to your wishlist.");
            return;
        }

        if (isWishlisted) {
                await removeFromWishlist(currentUser.uid, itemId);
            } else {
                await addProductToWishlist(currentUser.uid, itemId);
            }
            setIsWishlisted(!isWishlisted);
    };

    if (!currentUser || currentUser.uid === itemOwnerId) {
        return null;
    }

    return (
        <button onClick={handleWishlistToggle}
        style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: isWishlisted ? 'black' : 'gray',
        }}>
            {isWishlisted ? '♥︎' : '♡'}
        </button>
    );
};

export default WishlistButton;



