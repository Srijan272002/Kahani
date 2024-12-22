import React from 'react';
import { Library } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gradient-to-b from-black/80 to-transparent p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Library className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-white">Kahani</h1>
        </Link>
        <nav className="flex gap-6">
          <Link to="/explore" className="text-white hover:text-purple-400 transition">
            Explore
          </Link>
          <Link to="/wishlist" className="text-white hover:text-purple-400 transition">
            Wishlist
          </Link>
          <Link to="/profile" className="text-white hover:text-purple-400 transition">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}