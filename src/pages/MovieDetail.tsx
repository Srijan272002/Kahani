import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { formatDate, formatRuntime } from '../utils/date';
import { getImageUrl, formatCurrency, formatLanguage } from '../utils/tmdb';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { MovieDetails, Credits, Video, Image } from '../types/api.types';

type TabType = 'overview' | 'cast' | 'media';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { getMovie, getMovieCredits, getMovieVideos, rateMovie, markAsFavorite, addToWatchlist } = useTMDB();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<{ results: Video[] } | null>(null);

  useEffect(() => {
    async function fetchMovieData() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [movieData, creditsData, videosData] = await Promise.all([
          getMovie(parseInt(id)),
          getMovieCredits(parseInt(id)),
          getMovieVideos(parseInt(id))
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch movie details'));
      } finally {
        setLoading(false);
      }
    }

    fetchMovieData();
  }, [id, getMovie, getMovieCredits, getMovieVideos]);

  const handleRate = async (rating: number) => {
    if (!id) return;
    try {
      await rateMovie(parseInt(id), rating);
    } catch (error) {
      console.error('Failed to rate movie:', error);
    }
  };

  const handleFavorite = async () => {
    if (!id) return;
    try {
      await markAsFavorite('movie', parseInt(id), true);
    } catch (error) {
      console.error('Failed to mark movie as favorite:', error);
    }
  };

  const handleWatchlist = async () => {
    if (!id) return;
    try {
      await addToWatchlist('movie', parseInt(id), true);
    } catch (error) {
      console.error('Failed to add movie to watchlist:', error);
    }
  };

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
        <ErrorMessage
          message={error.message}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Movie not found" />
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-64 shrink-0 mx-auto md:mx-0">
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="text-gray-300">
                {formatDate(movie.release_date)}
              </div>
              <div className="text-gray-300">•</div>
              <div className="text-gray-300">
                {formatRuntime(movie.runtime ?? 0)}
              </div>
              {movie.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/movies?genres=${genre.id}`}
                  className="text-primary-400 hover:text-primary-300"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="flex gap-4 mb-8">
              <button
                onClick={() => handleRate(8)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                         transition-colors"
              >
                ★ {movie.vote_average.toFixed(1)}
              </button>
              <button
                onClick={handleFavorite}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                         transition-colors"
              >
                ♥ Favorite
              </button>
              <button
                onClick={handleWatchlist}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                         transition-colors"
              >
                + Watchlist
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
              <p className="text-gray-300">{movie.overview}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {movie.budget > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Budget</h3>
                  <p className="text-white">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Revenue</h3>
                  <p className="text-white">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
              {movie.spoken_languages?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Languages</h3>
                  <p className="text-white">
                    {movie.spoken_languages
                      .map((lang) => formatLanguage(lang.iso_639_1))
                      .join(', ')}
                  </p>
                </div>
              )}
              {movie.production_companies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Studios</h3>
                  <p className="text-white">
                    {movie.production_companies.map((company) => company.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-700">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('cast')}
                className={`pb-4 text-lg font-medium transition-colors ${
                  activeTab === 'cast'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Cast
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`pb-4 text-lg font-medium transition-colors ${
                  activeTab === 'media'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Media
              </button>
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Additional movie details */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Status</dt>
                      <dd className="text-white">{movie.status}</dd>
                    </div>
                    {movie.release_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Release Date</dt>
                        <dd className="text-white">{formatDate(movie.release_date)}</dd>
                      </div>
                    )}
                    {movie.runtime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Runtime</dt>
                        <dd className="text-white">{formatRuntime(movie.runtime)}</dd>
                      </div>
                    )}
                    {movie.budget > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Budget</dt>
                        <dd className="text-white">{formatCurrency(movie.budget)}</dd>
                      </div>
                    )}
                    {movie.revenue > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Revenue</dt>
                        <dd className="text-white">{formatCurrency(movie.revenue)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Cast preview */}
                {credits?.cast && credits.cast.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Top Cast</h3>
                    <div className="space-y-4">
                      {credits.cast.slice(0, 5).map((person) => (
                        <div key={person.id} className="flex items-center gap-4">
                          <img
                            src={getImageUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-white font-medium">{person.name}</div>
                            <div className="text-gray-400 text-sm">{person.character}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && credits?.cast && credits.cast.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {credits.cast.map((person) => (
                  <div key={person.id} className="text-center">
                    <img
                      src={getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      className="w-full aspect-[2/3] rounded-lg object-cover mb-2"
                    />
                    <div className="text-white font-medium">{person.name}</div>
                    <div className="text-gray-400 text-sm">{person.character}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-8">
                {/* Videos */}
                {videos?.results && videos.results.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videos.results.map((video) => (
                        <div key={video.id} className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.key}`}
                            title={video.name}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {movie.images?.backdrops && movie.images.backdrops.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {movie.images.backdrops.map((image: Image, index: number) => (
                        <img
                          key={index}
                          src={getImageUrl(image.file_path, 'w780')}
                          alt={`${movie.title} backdrop ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 