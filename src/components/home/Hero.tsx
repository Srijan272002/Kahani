import React from 'react';
import { SearchBar } from '../search/SearchBar';

export function Hero() {
  return (
    <div className="relative min-h-[500px] flex items-center justify-center text-center px-4 py-20">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Where stories come alive.
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Search across movies, books, and TV shows
        </p>
        <SearchBar />
      </div>
    </div>
  );
}