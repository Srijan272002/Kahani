import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Movie, TVShow, Person } from '../types/api.types';
import { MovieCard } from '../components/movies/MovieCard';
import { TVShowCard } from '../components/tvshows/TVShowCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { getImageUrl } from '../utils/tmdb';

type MediaType = 'movie' | 'tv' | 'person';

interface SearchResult {
  id: number;
  media_type: MediaType;
  data: Movie | TVShow | Person;
}

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState<MediaType>(
    (searchParams.get('type') as MediaType) || 'movie'
  );

  const debouncedQuery = useDebounce(query, 500);
  const { searchMovies, searchTVShows, searchPeople } = useTMDB();

  const {
    data: searchResults,
    loading,
    error,
    hasMore,
    ref,
  } = useInfiniteScroll<SearchResult>({
    fetchFn: async (page) => {
      if (!debouncedQuery) {
        return { data: [], hasMore: false };
      }

      let data: SearchResult[] = [];
      let hasMore = false;

      switch (activeType) {
        case 'movie': {
          const result = await searchMovies(debouncedQuery, page);
          data = result.results.map((movie) => ({
            id: movie.id,
            media_type: 'movie',
            data: movie,
          }));
          hasMore = result.page < result.total_pages;
          break;
        }
        case 'tv': {
          const result = await searchTVShows(debouncedQuery, page);
          data = result.results.map((tvShow) => ({
            id: tvShow.id,
            media_type: 'tv',
            data: tvShow,
          }));
          hasMore = result.page < result.total_pages;
          break;
        }
        case 'person': {
          const result = await searchPeople(debouncedQuery, page);
          data = result.results.map((person) => ({
            id: person.id,
            media_type: 'person',
            data: person,
          }));
          hasMore = result.page < result.total_pages;
          break;
        }
      }

      return { data, hasMore };
    },
    dependencies: [debouncedQuery, activeType],
  });

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeType) params.set('type', activeType);
    setSearchParams(params);
  }, [query, activeType, setSearchParams]);

  const renderResult = (result: SearchResult) => {
    switch (result.media_type) {
      case 'movie':
        return <MovieCard key={result.id} movie={result.data as Movie} view="grid" />;
      case 'tv':
        return <TVShowCard key={result.id} tvShow={result.data as TVShow} view="grid" />;
      case 'person':
        return (
          <Link
            key={result.id}
            to={`/person/${result.id}`}
            className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden 
                     shadow-md hover:shadow-xl transition-shadow"
          >
            <div className="aspect-[2/3] relative">
              <img
                src={getImageUrl((result.data as Person).profile_path, 'w500')}
                alt={(result.data as Person).name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 
                           dark:group-hover:text-primary-400">
                {(result.data as Person).name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(result.data as Person).known_for_department}
              </p>
            </div>
          </Link>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies, TV shows, or people..."
          className="w-full px-4 py-3 text-lg rounded-lg border border-gray-300 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 
                   focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Media Type Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveType('movie')}
            className={`pb-4 text-lg font-medium transition-colors ${
              activeType === 'movie'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveType('tv')}
            className={`pb-4 text-lg font-medium transition-colors ${
              activeType === 'tv'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            TV Shows
          </button>
          <button
            onClick={() => setActiveType('person')}
            className={`pb-4 text-lg font-medium transition-colors ${
              activeType === 'person'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            People
          </button>
        </nav>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error.message} />}

      {/* Empty State */}
      {!loading && searchResults.length === 0 && debouncedQuery && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No results found for "{debouncedQuery}"
          </p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {searchResults.map((result) => renderResult(result))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && <div ref={ref} className="h-10" />}
    </div>
  );
} 