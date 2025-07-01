import React, {useState, useEffect} from "react";
import {db} from "../firebaseConfig";
import {collection, getDocs} from 'firebase/firestore';
import ItemCard from "./ItemCard";
import SearchBar from "./SearchBar";
import '../App.css';

function Home(){
    const [allItems, setAllItems] = useState([]); // Todos os items
    const [displayedItems, setDisplayedItems] = useState([]); // Items a mostrar
    const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carregar todos os items uma vez
    useEffect(() => {
        const fetchItems = async () => {
            try{
                const itemsCollectionRef = collection(db, 'items');
                const querySnapshot = await getDocs(itemsCollectionRef);
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const availableItems = data.filter(item => !item.isSold);
                setAllItems(availableItems);
                setDisplayedItems(availableItems); // Mostrar todos inicialmente
            } catch (error) {
                console.error('Error loading items: ', error);
                setError('Impossible to load items');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Filtrar items baseado no termo de pesquisa
    useEffect(() => {
        if (!searchTerm.trim()) {
            setDisplayedItems(allItems); // Se não há pesquisa, mostrar todos
        } else {
            const filtered = allItems.filter(item => {
                const searchTermLower = searchTerm.toLowerCase();
                const title = item.title?.toLowerCase() || '';
                const brand = item.brand?.toLowerCase() || '';
                const description = item.description?.toLowerCase() || '';
                
                return title.includes(searchTermLower) || 
                       brand.includes(searchTermLower) || 
                       description.includes(searchTermLower);
            });
            setDisplayedItems(filtered);
        }
    }, [searchTerm, allItems]);

    // Função para receber o termo de pesquisa da SearchBar
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    if (loading) {
        return <p>Loading items...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return(
        <div>
            <h1 className="pageTitle">Home</h1>
            
            {/* SearchBar integrada */}
            <SearchBar onSearch={handleSearch} />
            
            {/* Mostrar informação sobre os resultados */}
            {searchTerm && (
                <div style={{ margin: '20px 0', textAlign: 'center' }}>
                    <p>
                        {displayedItems.length > 0 
                            ? `Found ${displayedItems.length} items for "${searchTerm}"` 
                            : `No items found for "${searchTerm}"`
                        }
                    </p>
                </div>
            )}

            <div className = 'displayItems'>
                {displayedItems.map(item=>(
                    <ItemCard key={item.id} item={item}/>
                ))}
            </div>

            {displayedItems.length === 0 && !loading && !searchTerm && (
                <p style={{ textAlign: 'center' }}>No items available</p>
            )}
        </div>
    );
}

export default Home;