import { Link } from 'react-router-dom';
import { TVShow } from '../../types/api.types';
import { useTMDB } from '../../hooks/useTMDB';
import { formatDate } from '../../utils/date';
import { getImageUrl } from '../../utils/tmdb';

interface TVShowCardProps {
  tvShow: TVShow;
  view: 'grid' | 'list';
  className?: string;
}

export function TVShowCard({ tvShow, view, className = '' }: TVShowCardProps) {
  const { rateTVShow, markAsFavorite, addToWatchlist } = useTMDB();

  const handleRate = async (rating: number) => {
    try {
      await rateTVShow(tvShow.id, rating);
    } catch (error) {
      console.error('Failed to rate TV show:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      await markAsFavorite('tv', tvShow.id, true);
    } catch (error) {
      console.error('Failed to mark TV show as favorite:', error);
    }
  };

  const handleWatchlist = async () => {
    try {
      await addToWatchlist('tv', tvShow.id, true);
    } catch (error) {
      console.error('Failed to add TV show to watchlist:', error);
    }
  };

  if (view === 'grid') {
    return (
      <div
        className={`group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden 
                   shadow-md hover:shadow-xl transition-shadow ${className}`}
      >
        <Link to={`/tv/${tvShow.id}`} className="block aspect-[2/3] relative">
          <img
            src={getImageUrl(tvShow.poster_path, 'w500')}
            alt={tvShow.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-sm line-clamp-3">{tvShow.overview}</p>
            </div>
          </div>
        </Link>
        <div className="p-4">
          <Link
            to={`/tv/${tvShow.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-500 
                     dark:hover:text-primary-400 line-clamp-2"
          >
            {tvShow.name}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(tvShow.first_air_date)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleRate(8)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                       dark:hover:text-primary-400"
            >
              ★ {tvShow.vote_average.toFixed(1)}
            </button>
            <button
              onClick={handleFavorite}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                       dark:hover:text-primary-400"
            >
              ♥ Favorite
            </button>
            <button
              onClick={handleWatchlist}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                       dark:hover:text-primary-400"
            >
              + Watchlist
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden 
                 shadow-md hover:shadow-xl transition-shadow ${className}`}
    >
      <Link to={`/tv/${tvShow.id}`} className="w-48 shrink-0">
        <img
          src={getImageUrl(tvShow.poster_path, 'w342')}
          alt={tvShow.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col flex-1 p-4">
        <Link
          to={`/tv/${tvShow.id}`}
          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-500 
                   dark:hover:text-primary-400"
        >
          {tvShow.name}
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formatDate(tvShow.first_air_date)}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">{tvShow.overview}</p>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handleRate(8)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                     dark:hover:text-primary-400"
          >
            ★ {tvShow.vote_average.toFixed(1)}
          </button>
          <button
            onClick={handleFavorite}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                     dark:hover:text-primary-400"
          >
            ♥ Favorite
          </button>
          <button
            onClick={handleWatchlist}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                     dark:hover:text-primary-400"
          >
            + Watchlist
          </button>
        </div>
      </div>
    </div>
  );
} 