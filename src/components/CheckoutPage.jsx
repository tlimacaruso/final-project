import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../App.css';

function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const itemDocRef = doc(db, 'items', id);
                const itemSnap = await getDoc(itemDocRef);

                if (itemSnap.exists()) {
                    setItem({ ...itemSnap.data(), id: itemSnap.id });
                } else {
                    setError("Item not found.");
                }
            } catch (err) {
                console.error("Error fetching item for checkout:", err);
                setError("Failed to load item details for checkout.");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchItem();
        } else {
            setError("No item ID provided for checkout.");
            setLoading(false);
        }
    }, [id]);

    const handlePlaceOrder = async () => {

        if (!auth.currentUser) {
            alert("You have to be logged in to finish your purchase");
            navigate('/login');
            return;
        }

        try {
            const itemDocRef = doc(db, 'items', id);
            await updateDoc(itemDocRef, {
                isSold: true,
                buyerId: auth.currentUser.uid,
                soldAt: new Date(),
            });
        alert(`You purchased: ${item.name} from ${item.userName} for €${item.price}! ☺︎`);
        navigate('/');
        } catch (error) {
            console.error("Error in finalizing your purchase: ", error);
            alert("We weren't able to process your purchase. Please try again.")
        }
    };

    if (loading) {
        return <p>Loading item details for checkout...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (item.isSold) {
        return (
            <div className="checkout-container">
                <h2>Item already sold ☹︎</h2>
                <p>This item was already sold! Continue browsing to find something similar!</p>
                <button onClick={() => navigate('/')}>Back to Home page</button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>
            <div className="checkout-item-details">
                <h3>{item.name}</h3>
                {item.images && item.images.length > 0 && (
                    <img
                        src={`https://res.cloudinary.com/djlvpxr7a/image/upload/w_200,h_200,c_fill/${item.images[0]}`}
                        alt={item.name}
                        className="checkout-item-image"
                    />
                )}
                <p>{item.description}</p>
                <p><strong>Price:</strong> € {item.price}</p>
                <p><strong>Condition:</strong> {item.condition}</p>
                <p><strong>Color:</strong> {Array.isArray(item.color) ? item.color.join(', ') : item.color}</p>
            </div>
            <button onClick={handlePlaceOrder} className="place-order-button">
                Place order
            </button>
        </div>
    );

};

export default CheckoutPage;