import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, type: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
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
            placeholder="Search across movies, books, and TV shows..."
            className="w-full px-4 py-3 pl-12 bg-white/10 text-white rounded-lg border border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="book">Books</option>
          <option value="tv">TV Shows</option>
        </select>
        <button
          type="submit"
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}