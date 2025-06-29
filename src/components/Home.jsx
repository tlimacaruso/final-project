import React, {useState, useEffect} from "react";
import {auth,db} from "../firebaseConfig";
import {collection, getDocs} from 'firebase/firestore';
import { Link } from "react-router-dom";
import ItemCard from "./ItemCard";

function Home(){

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try{
                const itemsCollectionRef = collection(db, 'items');
                const querySnapshot = await getDocs(itemsCollectionRef);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setItems(data);
            } catch (error) {
                console.error('Error loading items: ', error);
                setError('Impossible to load items');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    if (loading) {
        return <p>Loading items...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return(
        <div>
            <h1>Home</h1>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                    {items.map(item=>(
                        <ItemCard key= {item.id} item = {item}/>
                    ))}
                </div>
        </div>
    );
}

export default Home;