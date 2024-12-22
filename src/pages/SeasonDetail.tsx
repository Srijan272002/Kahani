import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface Episode {
  id: string;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string;
  stillPath: string | null;
  runtime: number;
  voteAverage: number;
}

interface SeasonDetails {
  id: string;
  showId: string;
  showTitle: string;
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string;
  episodes: Episode[];
}

const SeasonDetail: React.FC = () => {
  const { showId, seasonNumber } = useParams<{ showId: string; seasonNumber: string }>();
  const navigate = useNavigate();
  const [season, setSeason] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tv/${showId}/season/${seasonNumber}`
        );
        setSeason(response.data.data);
      } catch (err) {
        setError('Failed to fetch season details. Please try again later.');
        console.error('Error fetching season details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showId && seasonNumber) {
      fetchSeasonDetails();
    }
  }, [showId, seasonNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/tv/${showId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Show
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <Link
            to={`/tv/${showId}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {season.showTitle}
          </Link>
          <span>/</span>
          <span>{season.name}</span>
        </div>
        <div className="flex gap-8">
          {season.posterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w300${season.posterPath}`}
              alt={season.name}
              className="w-48 rounded-lg shadow-lg"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {season.name}
            </h1>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              {season.episodes.length} Episodes • First Aired {new Date(season.airDate).toLocaleDateString()}
            </div>
            {season.overview && (
              <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
                {season.overview}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Episodes</h2>
        <div className="grid gap-6">
          {season.episodes.map((episode) => (
            <div
              key={episode.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="flex">
                {episode.stillPath && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${episode.stillPath}`}
                    alt={episode.name}
                    className="w-48 h-32 object-cover"
                  />
                )}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/tv/${showId}/season/${seasonNumber}/episode/${episode.episodeNumber}`}
                        className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {episode.episodeNumber}. {episode.name}
                      </Link>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(episode.airDate).toLocaleDateString()} • {episode.runtime} min
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        {episode.voteAverage.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {episode.overview && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                      {episode.overview}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonDetail; 