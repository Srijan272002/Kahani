import React from 'react';
import { Heart } from 'lucide-react';
import type { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onWishlist?: (item: MediaItem) => void;
  isWishlisted?: boolean;
}

export function MediaCard({ item, onWishlist, isWishlisted }: MediaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative aspect-[2/3] bg-gray-200">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {item.title}
          </h3>
          {onWishlist && (
            <button
              onClick={() => onWishlist(item)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            {item.type.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">{item.year}</span>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}