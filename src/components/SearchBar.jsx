import React from "react";
import { Search, X } from "lucide-react";
import useSearch from "./hooks/useSearch";
import useSearchResults from "./hooks/useSearchResults";
import './SearchBar.css';

function SearchBar() {
    const { 
        searchTerm, 
        setSearchTerm, 
        isSearching, 
        handleSearchSubmit,
        clearSearch 
      } = useSearch();

      const { searchResults, loading, error } = useSearchResults();

      return (
        <div className="search-container">
        <form onSubmit={handleSearchSubmit} className="search-bar">
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Search users or items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={isSearching}
                />
                
                {searchTerm && (
                    <button 
                        type="button" 
                        onClick={clearSearch}
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

        {searchTerm && (
            <div className="search-results">
                {loading && <div className="loading">Loading...</div>}
                
                {error && <div className="error">Erro: {error}</div>}
                
                {searchResults && searchResults.length > 0 && (
                    <div className="results-list">
                        {searchResults.map((result, index) => (
                            <div key={index} className="result-item">
                                <h3>{result.name || result.title}</h3>
                                <p>{result.description || result.email}</p>
                            </div>
                        ))}
                    </div>
                )}
                
                {searchResults && searchResults.length === 0 && !loading && (
                    <div className="no-results">No results ☹︎</div>
                )}
            </div>
        )}
    </div>
);
}

export default SearchBar;