import React, {useEffect} from "react";
import { Search, X } from "lucide-react";
import useSearch from "./hooks/useSearch";
import useSearchResults from "./hooks/useSearchResults";
import '../App.css';

function SearchBar({ onSearch, showResults = false }) {
    const { 
        searchTerm, 
        setSearchTerm, 
        isSearching, 
        handleSearchSubmit,
        clearSearch 
    } = useSearch();

    useEffect(() => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    }, [searchTerm, onSearch]);

    const handleClear = () => {
        clearSearch();
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearchSubmit} className="search-bar">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        disabled={isSearching}
                    />
                    
                    {searchTerm && (
                        <button 
                            type="button" 
                            onClick={handleClear}
                            className="clear-button"
                            aria-label="Limpar pesquisa"
                        >
                            <X size={16} />
                        </button>
                    )}
                    
                    <button 
                        type="submit" 
                        className="search-button"
                        disabled={isSearching || !searchTerm.trim()}
                    >
                        <Search size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SearchBar;