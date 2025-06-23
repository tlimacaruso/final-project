import React, {useState, useEffect} from "react";
import {auth,db} from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {collection, getDocs} from 'firebase/firestore';

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
            <h1>Feed</h1>

            {items.map(item => (
                <div key={item.id}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p>Price: € {item.price}</p>
                    <p>Condition: {item.condition}</p>
                    <p>Category: {item.category}</p>
                    <p>Color: {item.color}</p>
                    <p>Size: {item.size}</p>
                    <p>Brand:{item.brand}</p>
                    {item.images && item.images.map((img,i)=>(
                        <img key={i} src={img} alt={`Item ${item.name}`} width='200'/>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Home;