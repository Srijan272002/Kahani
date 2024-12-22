import { Heart } from 'lucide-react';
import type { MediaItem } from '../../types';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  explanation?: string;
}

export function MediaGrid({ title, items, explanation }: MediaGridProps) {
  return (
    <section className="py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {explanation && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{explanation}</span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200">
              <img
                src={item.poster || '/placeholder-poster.png'}
                alt={item.title}
                className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
              />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                <Heart className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.year}
                </p>
                {item.rating && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.rating.toFixed(1)}
                    </span>
                    <svg
                      className="h-4 w-4 text-yellow-400 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.585l-6.327 3.323 1.209-7.037L.172 7.332l7.063-1.027L10 0l2.765 6.305 7.063 1.027-4.71 4.539 1.209 7.037L10 15.585z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}