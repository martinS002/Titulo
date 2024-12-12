import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="border rounded-md p-2 w-full"
      />
      <button type="submit" className="mt-2 bg-blue-600 text-white p-2 rounded-md">
        Buscar
      </button>
    </form>
  );
}