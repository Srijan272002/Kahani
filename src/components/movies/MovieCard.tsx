import { Link } from 'react-router-dom';
import { Movie } from '../../types/api.types';
import { useTMDB } from '../../hooks/useTMDB';
import { getImageUrl } from '../../utils/tmdb';
import { formatDate } from '../../utils/date';

interface MovieCardProps {
  movie: Movie;
  view: 'grid' | 'list';
  className?: string;
}

export function MovieCard({ movie, view, className = '' }: MovieCardProps) {
  const { rateMovie, markAsFavorite, addToWatchlist } = useTMDB();

  const handleRate = async (rating: number) => {
    try {
      await rateMovie(movie.id, rating);
    } catch (error) {
      console.error('Failed to rate movie:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      await markAsFavorite('movie', movie.id, true);
    } catch (error) {
      console.error('Failed to mark movie as favorite:', error);
    }
  };

  const handleWatchlist = async () => {
    try {
      await addToWatchlist('movie', movie.id, true);
    } catch (error) {
      console.error('Failed to add movie to watchlist:', error);
    }
  };

  if (view === 'grid') {
    return (
      <div
        className={`group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden 
                   shadow-md hover:shadow-xl transition-shadow ${className}`}
      >
        <Link to={`/movies/${movie.id}`} className="block aspect-[2/3] relative">
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-sm line-clamp-3">{movie.overview}</p>
            </div>
          </div>
        </Link>
        <div className="p-4">
          <Link
            to={`/movies/${movie.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-500 
                     dark:hover:text-primary-400 line-clamp-2"
          >
            {movie.title}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(movie.release_date)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleRate(8)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                       dark:hover:text-primary-400"
            >
              ★ {movie.vote_average.toFixed(1)}
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
      <Link to={`/movies/${movie.id}`} className="w-48 shrink-0">
        <img
          src={getImageUrl(movie.poster_path, 'w342')}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col flex-1 p-4">
        <Link
          to={`/movies/${movie.id}`}
          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-500 
                   dark:hover:text-primary-400"
        >
          {movie.title}
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {formatDate(movie.release_date)}
        </p>
        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">{movie.overview}</p>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handleRate(8)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500 
                     dark:hover:text-primary-400"
          >
            ★ {movie.vote_average.toFixed(1)}
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