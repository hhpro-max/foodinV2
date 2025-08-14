import React, { useState, useEffect } from 'react';
import { debounce } from '../utils/debounce';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = debounce((value) => {
    onSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-control"
      />
    </div>
  );
};

export default SearchBar;