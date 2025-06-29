import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from 'firebase/firestore';
import { Link } from "react-router-dom";
import WishlistButton from "./WishlistButton";

function ItemCard({ item }) {

    /* const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot =await getDocs(collection(db, 'items'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setItems(data);
        };

        fetchItems();
    }, []);  */

    if (!item) {
        return null;
    }

    const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djlvpxr7a/image/upload";

    const imageUrl = item.images && item.images.length > 0
        ? `${CLOUDINARY_BASE_URL}/w_200,h_200,c_fill/${item.images[0]}`
        : 'placeholder_image_url.jpg';


    return (
        <div className="itemCard">
            <div key={item.id} className="item-card-container">
                <Link to={`/details/${item.id}`} className="item-card-link">
                    <div className="item-card-image-wrapper">
                        <img
                            src={imageUrl}
                            alt={`Item ${item.name}`}
                            className="item-card-image"
                        />
                    </div>
                    <div className="item-card-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Price: € {item.price}</p>
                        <p>Condition: {item.condition}</p>
                        <p>Category: {item.category}</p>
                        {item.color && Array.isArray(item.color) && (
                            <p>Color: {item.color.join(', ')}</p>
                        )}
                        <p>Size: {item.size}</p>
                        <p>Brand:{item.brand}</p>
                        
                        {item.userId && item.userName ? (
                            <p>Posted by: <Link to={`/profile/${item.userId}`}><strong>{item.userName}</strong></Link></p>
                        ) : (
                            <p>Posted by: Unknown</p>
                        )}
                        {/*  <Link to={`/details/${item.id}`}>Details</Link> */}

                    </div>
                </Link>
                <WishlistButton 
                            itemId={item.id} 
                            itemOwnerId={item.userId}/>
            </div>
        </div>
    );
}

export default ItemCard;