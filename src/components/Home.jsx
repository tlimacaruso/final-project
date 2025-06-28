import React, {useState, useEffect} from "react";
import {auth,db} from "../firebaseConfig";
import {collection, getDocs} from 'firebase/firestore';
import { Link } from "react-router-dom";

function Home(){

    const [items, setItems] = useState([]);

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
    }, []);

    return(
        <div>
            <h1>Home</h1>

            {items.map(item => (
                <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p>Price: € {item.price}</p>
                    <p>Condition: {item.condition}</p>
                    <p>Category: {item.category}</p>
                    <p>Color: {item.color.join(', ')}</p>
                    <p>Size: {item.size}</p>
                    <p>Brand:{item.brand}</p>
                    {item.images && item.images.map((img,i)=>(
                        <img key={i} src={`https://res.cloudinary.com/djlvpxr7a/image/upload/w_200,h_200,c_fill/${img}`} alt={`Item ${item.name}`} width='200' style={{ marginRight: '10px' }}/>
                    ))}
                    {item.userId && item.userName ? (
                        <p>Posted by: <Link to ={`/profile/${item.userId}`}><strong>{item.userName}</strong></Link></p>
                    ) : (
                        <p>Posted by: Unknown</p>
                )}
                <Link to={`/details/${item.id}`}>Details</Link>
                </div>
                
            ))}
        </div>
    );
}

export default Home;