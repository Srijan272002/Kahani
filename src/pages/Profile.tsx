import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTMDB } from '../hooks/useTMDB';
import { Movie, TVShow } from '../types/api.types';
import { MovieCard } from '../components/movies/MovieCard';
import { TVShowCard } from '../components/tvshows/TVShowCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

type TabType = 'favorites' | 'watchlist' | 'ratings';
type MediaType = 'movies' | 'tvshows';

export default function Profile() {
  const { user } = useAuth();
  const { getFavoriteMovies, getFavoriteTVShows, getWatchlistMovies, getWatchlistTVShows } = useTMDB();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [mediaType, setMediaType] = useState<MediaType>('movies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [favorites, setFavorites] = useState<{ movies: Movie[]; tvshows: TVShow[] }>({
    movies: [],
    tvshows: [],
  });
  const [watchlist, setWatchlist] = useState<{ movies: Movie[]; tvshows: TVShow[] }>({
    movies: [],
    tvshows: [],
  });

  useEffect(() => {
    async function fetchUserLists() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const [favoriteMovies, favoriteTVShows, watchlistMovies, watchlistTVShows] = await Promise.all([
          getFavoriteMovies(),
          getFavoriteTVShows(),
          getWatchlistMovies(),
          getWatchlistTVShows(),
        ]);

        setFavorites({
          movies: favoriteMovies.results,
          tvshows: favoriteTVShows.results,
        });

        setWatchlist({
          movies: watchlistMovies.results,
          tvshows: watchlistTVShows.results,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user lists'));
      } finally {
        setLoading(false);
      }
    }

    fetchUserLists();
  }, [user, getFavoriteMovies, getFavoriteTVShows, getWatchlistMovies, getWatchlistTVShows]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to view your profile
          </h1>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const activeList = activeTab === 'favorites' ? favorites : watchlist;
  const currentItems = mediaType === 'movies' ? activeList.movies : activeList.tvshows;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.name || 'User Profile'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
        </div>
        <Link
          to="/settings"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 text-lg font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`pb-4 text-lg font-medium transition-colors ${
                activeTab === 'watchlist'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Watchlist
            </button>
          </nav>
        </div>
      </div>

      {/* Media Type Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setMediaType('movies')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mediaType === 'movies'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Movies
        </button>
        <button
          onClick={() => setMediaType('tvshows')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mediaType === 'tvshows'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          TV Shows
        </button>
      </div>

      {/* Content */}
      {currentItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No {mediaType === 'movies' ? 'movies' : 'TV shows'} in your {activeTab} yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mediaType === 'movies'
            ? currentItems.map((item) => (
                <MovieCard key={item.id} movie={item as Movie} view="grid" />
              ))
            : currentItems.map((item) => (
                <TVShowCard key={item.id} tvShow={item as TVShow} view="grid" />
              ))}
        </div>
      )}
    </div>
  );
} 