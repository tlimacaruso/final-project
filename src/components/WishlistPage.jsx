import { getUserWishlist, removeFromWishlist } from "../services/wishlistService";
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from "react-router-dom";
import '../App.css';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (!user) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!currentUser) {
                setWishlistItems([]);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);

                const itemIds = await getUserWishlist(currentUser.uid);
                console.log('Item IDs from wishlist: ', itemIds);

                if (itemIds.length > 0) {
                    const q = query(
                        collection(db, 'items'),
                        where('__name__', 'in', itemIds)
                    );
                    const querySnapshot = await getDocs(q);
                    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log('Fetched items: ', items);
                    setWishlistItems(items);
                } else {
                    setWishlistItems([]);
                }
            } catch (error) {
                console.error('Error fetching wishlist', error);
                setError('Failed to load wishlist. Try again');
                setWishlistItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [currentUser]);

    const handleRemoveFromWishlist = async (itemId) => {
        if (!currentUser) return;

        try {
            await removeFromWishlist(currentUser.uid, itemId);
            setWishlistItems(prevItems =>
                prevItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            alert("Failed to remove item from wishlist. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p style={{ fontSize: '18px' }}>Loading wishlist... ♥</p>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Access Denied</h2>
                <p>You need to be logged in to view your wishlist.</p>
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Go to Login
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Your Wishlist</h2>
                <p style={{ fontSize: '18px', color: '#666' }}>Your wishlist is empty!</p>
                <p>Start adding items you love to see them here.</p>
                <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Browse Items
                </Link>
            </div>
        );
    }

    const getImageUrl = (item) => {
        const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djlvpxr7a/image/upload";

        if (item.images && item.images.length > 0) {
            return `${CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${item.images[0]}`;
        }
        if (item.imageUrl) {
            return item.imageUrl;
        }
        return 'https://via.placeholder.com/200x200?text=No+Image';
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className= 'wishlist-page' style={{ textAlign: 'center', marginBottom: '30px' }}>
                My Wishlist ({wishlistItems.length} items)
            </h2>
            <div className = 'displayItems'>
                {wishlistItems.map(item => (
                    <div key={item.id} className = 'item-card-container'>

                        <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#000000',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '35px',
                                height: '35px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Remove from wishlist">
                            ×
                        </button>

                        <Link
                            to={`/details/${item.id}`}
                            style={{ textDecoration: 'none'}}
                        >
                            <img
                                src={getImageUrl(item)}
                                alt={item.name || 'Item image'}
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    objectFit: 'cover',
                                    marginBottom: '10px'
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                }}
                            />

                            <h3 style={{
                                margin: '10px 0 5px 0',
                                fontSize: '16px',
                                color: '#333'
                            }}>
                                {item.name || 'Unnamed Item'}
                            </h3>

                            <p style={{
                                color: '#666',
                                fontSize: '14px',
                                margin: '5px 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {item.description || 'No description'}
                            </p>

                            <p style={{
                                fontWeight: 'bold',
                                color: '#007bff',
                                fontSize: '16px',
                                margin: '10px 0 5px 0'
                            }}>
                                €{item.price || '0'}
                            </p>


                            <div style={{ fontSize: '12px', color: '#888' }}>
                                {item.condition && <p>Condition: {item.condition}</p>}
                                {item.brand && <p>Brand: {item.brand}</p>}
                                {item.size && <p>Size: {item.size}</p>}
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Link className="optBtn">
                    Continue Shopping
                </Link>

            </div>
        </div>
    );

};

export default WishlistPage;