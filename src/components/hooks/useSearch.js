import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const performSearch = async (term = searchTerm) => {
        const cleanTerm = term.trim();

        if (!cleanTerm) {
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        
        setTimeout(() => {
            setIsSearching(false);
        }, 1000);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
    };
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch();
    };

    return {
        searchTerm,
        isSearching,
        
        setSearchTerm,
        performSearch,
        clearSearch,
        handleSearchSubmit
    };
};

export default useSearch;