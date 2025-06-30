import { useState, useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../firebaseConfig";

const useSearchResults = (searchTerm) => {
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchUsers = async (term) => {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const userResults = [];
        const searchTermLower = term.toLowerCase();

        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const username = userData.username?.toLowerCase() || '';
            const email = userData.email?.toLowerCase() || '';

            if (username.includes(searchTermLower) || email.includes(searchTermLower)) {
                userResults.push({
                    id: doc.id,
                    type: 'user', 
                    name: userData.username, 
                    description: userData.email, 
                    ...userData
                });
            }
        });

        return userResults;
    };

    const searchItems = async (term) => {
        const itemsRef = collection(db, 'items');
        const itemsSnapshot = await getDocs(itemsRef);
        const itemResults = [];
        const searchTermLower = term.toLowerCase();
    
        itemsSnapshot.forEach((doc) => {
            const itemData = doc.data();
            const title = itemData.title?.toLowerCase() || '';
            const brand = itemData.brand?.toLowerCase() || '';
            const description = itemData.description?.toLowerCase() || '';
            
            if (title.includes(searchTermLower) || 
                brand.includes(searchTermLower) || 
                description.includes(searchTermLower)) {
                itemResults.push({
                    id: doc.id,
                    type: 'item',
                    name: itemData.title,
                    title: itemData.title,
                    ...itemData
                });
            }
        });
    
        return itemResults;
    };

    const performSearch = async (term) => {
        if (!term?.trim()) {
            setUsers([]);
            setItems([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [userResults, itemResults] = await Promise.all([
                searchUsers(term.trim()),
                searchItems(term.trim())
            ]);

            setUsers(userResults);
            setItems(itemResults);
        } catch (error) {
            setError('Search error.');
            console.error('Search error: ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        performSearch(searchTerm);
    }, [searchTerm]);


    const searchResults = [...users, ...items];
    const totalResults = users.length + items.length;
    const hasResults = totalResults > 0;

    return {
        users,
        items,
        searchResults,
        totalResults,
        hasResults,
        
        loading,
        error,
        
        performSearch
    };
};

export default useSearchResults;