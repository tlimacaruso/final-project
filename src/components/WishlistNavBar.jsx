import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { getUserWishlist } from '../services/wishlistService';


export function useWishlistCount() {
    const [wishlistCount, setWishlistCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);

    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (!user) {
                setWishlistCount(0); 
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchCount = async () => {
            if (!currentUser) {
                setWishlistCount(0);
                return;
            }

            try {
                const itemIds = await getUserWishlist(currentUser.uid);
                setWishlistCount(itemIds.length);
            } catch (error) {
                console.error('Error fetching wishlist count:', error);
                setWishlistCount(0);
            }
        };

        fetchCount();
    }, [currentUser]);

    
    const refreshCount = async () => {
        if (!currentUser) return;
        
        try {
            const itemIds = await getUserWishlist(currentUser.uid);
            setWishlistCount(itemIds.length);
        } catch (error) {
            console.error('Error refreshing wishlist count:', error);
        }
    };

    return { wishlistCount, refreshCount };
}

function WishlistNavBar() {
    const { wishlistCount } = useWishlistCount();

    return (
        <Link to='/wishlist' className='wishlist-nav'>
            <Heart className='heart-icon' />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
                <span className='wishlist-counter'>{wishlistCount}</span>
            )}
        </Link>
    );
}

export default WishlistNavBar;