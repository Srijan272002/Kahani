import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface EpisodeDetails {
  id: string;
  showId: string;
  showTitle: string;
  seasonNumber: number;
  seasonName: string;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string;
  stillPath: string | null;
  runtime: number;
  voteAverage: number;
  crew: Array<{
    id: string;
    name: string;
    job: string;
    profilePath: string | null;
  }>;
  guestStars: Array<{
    id: string;
    name: string;
    character: string;
    profilePath: string | null;
  }>;
  director: string;
  writers: string[];
  rated: string;
  language: string[];
  productionCode: string;
  imdbRating: number;
  type: 'episode';
}

const EpisodeDetail: React.FC = () => {
  const { showId, seasonNumber, episodeNumber } = useParams<{
    showId: string;
    seasonNumber: string;
    episodeNumber: string;
  }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`
        );
        setEpisode(response.data.data);
      } catch (err) {
        setError('Failed to fetch episode details. Please try again later.');
        console.error('Error fetching episode details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (showId && seasonNumber && episodeNumber) {
      fetchEpisodeDetails();
    }
  }, [showId, seasonNumber, episodeNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/tv/${showId}/season/${seasonNumber}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Season
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-8">
        <Link
          to={`/tv/${showId}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {episode.showTitle}
        </Link>
        <span>/</span>
        <Link
          to={`/tv/${showId}/season/${seasonNumber}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {episode.seasonName}
        </Link>
        <span>/</span>
        <span>Episode {episode.episodeNumber}</span>
      </div>

      {/* Episode Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {episode.episodeNumber}. {episode.name}
        </h1>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
          <span>{new Date(episode.airDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>{episode.runtime} min</span>
          <span>•</span>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-400 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>IMDb: {episode.imdbRating}</span>
          </div>
        </div>
      </div>

      {/* Episode Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Still Image */}
          {episode.stillPath && (
            <img
              src={`https://image.tmdb.org/t/p/original${episode.stillPath}`}
              alt={episode.name}
              className="w-full rounded-lg shadow-lg"
            />
          )}

          {/* Overview */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300">{episode.overview}</p>
          </div>

          {/* Guest Stars */}
          {episode.guestStars.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Guest Stars</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {episode.guestStars.map((star) => (
                  <div key={star.id} className="text-center">
                    <img
                      src={
                        star.profilePath
                          ? `https://image.tmdb.org/t/p/w200${star.profilePath}`
                          : '/placeholder-avatar.png'
                      }
                      alt={star.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover mb-2"
                    />
                    <h3 className="font-medium text-gray-900 dark:text-white">{star.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{star.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Episode Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Episode Info</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Director</h3>
                <p className="text-gray-900 dark:text-white">{episode.director}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Writers</h3>
                <p className="text-gray-900 dark:text-white">{episode.writers.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</h3>
                <p className="text-gray-900 dark:text-white">{episode.rated}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</h3>
                <p className="text-gray-900 dark:text-white">{episode.language.join(', ')}</p>
              </div>
              {episode.productionCode && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Production Code</h3>
                  <p className="text-gray-900 dark:text-white">{episode.productionCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Crew */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crew</h2>
            <div className="space-y-4">
              {episode.crew.map((member) => (
                <div key={`${member.id}-${member.job}`}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {member.job}
                  </h3>
                  <p className="text-gray-900 dark:text-white">{member.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeDetail; 