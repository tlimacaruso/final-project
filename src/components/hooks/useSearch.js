import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const performSearch = (term = searchTerm) => {
        const cleanTerm = term.trim();

        if (!cleanTerm) return;

        setIsSearching(true);
    }

        const clearSearch = () => {
            setSearchTerm('');
          };
        
          const handleSearchSubmit = (e) => {
            e.preventDefault();
            performSearch();
          }

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