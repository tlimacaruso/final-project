import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useSearchResults from './hooks/useSearchResults';

function SearchResultsPage() {
    const { searchTerm } = useParams();
    const { users, items, loading, error } = useSearchResults(searchTerm);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="search-results-page">
            <h1>Search Results for: "{searchTerm}"</h1>
            
            <div className="results-navigation">
                <Link to={`/search/${searchTerm}/users`} className="nav-link">
                    Users ({users.length})
                </Link>
                <Link to={`/search/${searchTerm}/items`} className="nav-link">
                    Items ({items.length})
                </Link>
            </div>

            <div className="all-results">
                {users.length > 0 && (
                    <section className="users-section">
                        <h2>Users</h2>
                        <div className="results-grid">
                            {users.map((user) => (
                                <div key={user.id} className="result-card user-card">
                                    <h3>{user.username}</h3>
                                    <p>{user.email}</p>
                                    <Link to={`/user/${user.id}`}>View Profile</Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {items.length > 0 && (
                    <section className="items-section">
                        <h2>Items</h2>
                        <div className="results-grid">
                            {items.map((item) => (
                                <div key={item.id} className="result-card item-card">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    <span className="brand">{item.brand}</span>
                                    <Link to={`/item/${item.id}`}>View Item</Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {users.length === 0 && items.length === 0 && (
                    <div className="no-results">
                        <p>No results found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};


function UsersResultsPage() {
    const { searchTerm } = useParams();
    const { users, loading, error } = useSearchResults(searchTerm);

    if (loading) return <div className="loading">Loading users...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="users-results-page">
            <h1>Users - "{searchTerm}" ({users.length} results)</h1>
            
            <div className="results-grid">
                {users.map((user) => (
                    <div key={user.id} className="user-card">
                        <h3>{user.username}</h3>
                        <p>{user.email}</p>
                        <Link to={`/user/${user.id}`}>View Profile</Link>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="no-results">No users found</div>
            )}
        </div>
    );
};


function ItemsResultsPage() {
    const { searchTerm } = useParams();
    const { items, loading, error } = useSearchResults(searchTerm);

    if (loading) return <div className="loading">Loading items...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="items-results-page">
            <h1>Items - "{searchTerm}" ({items.length} results)</h1>
            
            <div className="results-grid">
                {items.map((item) => (
                    <div key={item.id} className="item-card">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <span className="brand">{item.brand}</span>
                        <Link to={`/item/${item.id}`}>View Item</Link>
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="no-results">No items found</div>
            )}
        </div>
    );
};


export { SearchResultsPage, UsersResultsPage, ItemsResultsPage};
