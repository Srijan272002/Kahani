import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { formatDate } from '../utils/date';
import { getImageUrl, formatLanguage } from '../utils/tmdb';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { TVShowDetails, Credits, Video, Image } from '../types/api.types';

type TabType = 'overview' | 'cast' | 'media' | 'seasons';

export function TvShowDetail() {
  const { id } = useParams<{ id: string }>();
  const { getTVShow, getTVShowCredits, getTVShowVideos, rateTVShow, markAsFavorite, addToWatchlist } = useTMDB();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<{ results: Video[] } | null>(null);

  useEffect(() => {
    async function fetchTVShowData() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [tvShowData, creditsData, videosData] = await Promise.all([
          getTVShow(parseInt(id)),
          getTVShowCredits(parseInt(id)),
          getTVShowVideos(parseInt(id))
        ]);

        setTVShow(tvShowData);
        setCredits(creditsData);
        setVideos(videosData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch TV show details'));
      } finally {
        setLoading(false);
      }
    }

    fetchTVShowData();
  }, [id, getTVShow, getTVShowCredits, getTVShowVideos]);

  const handleRate = async (rating: number) => {
    if (!id) return;
    try {
      await rateTVShow(parseInt(id), rating);
    } catch (error) {
      console.error('Failed to rate TV show:', error);
    }
  };

  const handleFavorite = async () => {
    if (!id) return;
    try {
      await markAsFavorite('tv', parseInt(id), true);
    } catch (error) {
      console.error('Failed to mark TV show as favorite:', error);
    }
  };

  const handleWatchlist = async () => {
    if (!id) return;
    try {
      await addToWatchlist('tv', parseInt(id), true);
    } catch (error) {
      console.error('Failed to add TV show to watchlist:', error);
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

  if (!tvShow) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="TV show not found" />
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(tvShow.backdrop_path, 'original')}
            alt={tvShow.name}
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
              src={getImageUrl(tvShow.poster_path, 'w500')}
              alt={tvShow.name}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{tvShow.name}</h1>
            {tvShow.tagline && (
              <p className="text-xl text-gray-300 italic mb-4">{tvShow.tagline}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="text-gray-300">
                {formatDate(tvShow.first_air_date)}
              </div>
              <div className="text-gray-300">•</div>
              <div className="text-gray-300">
                {tvShow.episode_run_time?.[0] ? `${tvShow.episode_run_time[0]}min` : 'N/A'}
              </div>
              {tvShow.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/tv?genres=${genre.id}`}
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
                ★ {tvShow.vote_average.toFixed(1)}
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
              <p className="text-gray-300">{tvShow.overview}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tvShow.number_of_seasons > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Seasons</h3>
                  <p className="text-white">{tvShow.number_of_seasons}</p>
                </div>
              )}
              {tvShow.number_of_episodes > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Episodes</h3>
                  <p className="text-white">{tvShow.number_of_episodes}</p>
                </div>
              )}
              {tvShow.spoken_languages?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Languages</h3>
                  <p className="text-white">
                    {tvShow.spoken_languages
                      .map((lang) => formatLanguage(lang.iso_639_1))
                      .join(', ')}
                  </p>
                </div>
              )}
              {tvShow.networks?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Networks</h3>
                  <p className="text-white">
                    {tvShow.networks.map((network) => network.name).join(', ')}
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
                onClick={() => setActiveTab('seasons')}
                className={`pb-4 text-lg font-medium transition-colors ${
                  activeTab === 'seasons'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Seasons
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
                {/* Additional TV show details */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-400">Status</dt>
                      <dd className="text-white">{tvShow.status}</dd>
                    </div>
                    {tvShow.first_air_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">First Air Date</dt>
                        <dd className="text-white">{formatDate(tvShow.first_air_date)}</dd>
                      </div>
                    )}
                    {tvShow.last_air_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Last Air Date</dt>
                        <dd className="text-white">{formatDate(tvShow.last_air_date)}</dd>
                      </div>
                    )}
                    {tvShow.episode_run_time?.[0] && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Episode Runtime</dt>
                        <dd className="text-white">{tvShow.episode_run_time[0]} minutes</dd>
                      </div>
                    )}
                    {tvShow.type && (
                      <div>
                        <dt className="text-sm font-medium text-gray-400">Type</dt>
                        <dd className="text-white">{tvShow.type}</dd>
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

            {activeTab === 'seasons' && tvShow.seasons && tvShow.seasons.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tvShow.seasons.map((season) => (
                  <Link
                    key={season.id}
                    to={`/tv/${tvShow.id}/season/${season.season_number}`}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 ring-primary-500 transition-all"
                  >
                    <img
                      src={getImageUrl(season.poster_path, 'w342')}
                      alt={season.name}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white">{season.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {season.episode_count} Episodes • {formatDate(season.air_date)}
                      </p>
                      {season.overview && (
                        <p className="text-gray-300 mt-2 line-clamp-2">{season.overview}</p>
                      )}
                    </div>
                  </Link>
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
                {tvShow.images?.backdrops && tvShow.images.backdrops.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tvShow.images.backdrops.map((image: Image, index: number) => (
                        <img
                          key={index}
                          src={getImageUrl(image.file_path, 'w780')}
                          alt={`${tvShow.name} backdrop ${index + 1}`}
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