import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Heart } from 'lucide-react';
import { getUserWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import '../App.css';

const WishlistButton = ({ itemId, itemOwnerId }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

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

        setLoading(true);

        try {
            if (isWishlisted) {
                await removeFromWishlist(currentUser.uid, itemId);
            } else {
                await addToWishlist(currentUser.uid, itemId);
            }
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            alert("Error updating wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.uid === itemOwnerId) {
        return null;
    }

    return (
        <button onClick={handleWishlistToggle}
            disabled={loading}
            style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '24px',
                opacity: loading ? 0.5 : 1,
                color: isWishlisted ? 'red' : 'gray',
            }}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            {isWishlisted ? '♥︎' : '♡'}
        </button>
    );

};

export default WishlistButton;


