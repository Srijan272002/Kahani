import React from 'react';
import { Heart, Star } from 'lucide-react';
import type { MediaItem } from '../../types';

interface MediaCardProps {
  item: MediaItem;
  showExplanation?: boolean;
}

export function MediaCard({ item, showExplanation }: MediaCardProps) {
  return (
    <div className="group relative rounded-lg overflow-hidden transition-transform hover:scale-105">
      <div className="aspect-[2/3] bg-gray-900">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 p-4 w-full">
            <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{item.year}</span>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{item.rating}</span>
                </div>
              )}
            </div>
            {showExplanation && item.explanation && (
              <p className="mt-2 text-sm text-gray-400">{item.explanation}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <button className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition">
                Details
              </button>
              <button className="p-1 hover:bg-white/10 rounded-full transition">
                <Heart className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}