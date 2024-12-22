import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, type: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState('movie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, mediaType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, books, or TV shows..."
            className="w-full px-4 py-2 pl-10 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="px-4 py-2 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="movie">Movies</option>
          <option value="book">Books</option>
          <option value="tv">TV Shows</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}