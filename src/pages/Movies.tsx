import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useDebounce } from '../hooks/useDebounce';
import { Movie, DiscoverMovieParams } from '../types/api.types';
import { MovieCard } from '../components/movies/MovieCard';
import { Select } from '../components/common/Select';

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Recently Released' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
] as const;

const yearOptions = Array.from({ length: 50 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<DiscoverMovieParams>({
    sort_by: searchParams.get('sort_by') || 'popularity.desc',
    primary_release_year: searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : undefined,
    with_genres: searchParams.get('genres') || undefined,
    with_watch_providers: searchParams.get('providers') || undefined,
    include_adult: false,
  });

  const debouncedFilters = useDebounce(filters, 500);
  const { discoverMovies } = useTMDB();

  const {
    data: movies,
    loading,
    error,
    hasMore,
    loadMore,
    ref,
  } = useInfiniteScroll<Movie>({
    fetchFn: async (page) => {
      const result = await discoverMovies({ ...debouncedFilters, page });
      return {
        data: result.results,
        hasMore: result.page < result.total_pages,
      };
    },
    dependencies: [debouncedFilters],
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.primary_release_year) params.set('year', filters.primary_release_year.toString());
    if (filters.with_genres) params.set('genres', filters.with_genres);
    if (filters.with_watch_providers) params.set('providers', filters.with_watch_providers);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = <K extends keyof DiscoverMovieParams>(
    key: K,
    value: DiscoverMovieParams[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const gridClasses = useMemo(
    () =>
      view === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
        : 'space-y-6',
    [view]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            label="Sort By"
            value={filters.sort_by || 'popularity.desc'}
            onChange={(value) => handleFilterChange('sort_by', value)}
            options={sortOptions}
          />

          <Select
            label="Year"
            value={filters.primary_release_year?.toString() || ''}
            onChange={(value: string) => handleFilterChange('primary_release_year', value ? parseInt(value) : undefined)}
            options={[{ value: '', label: 'All Years' }, ...yearOptions]}
          />

          <div className="flex-1" />

          <button
            type="button"
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            aria-label={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
          >
            {view === 'grid' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
          </button>
        </div>
      </div>
      {/* Error State */}
      {error && <div className="text-red-500 p-4 text-center">
        <p>{error.message}</p>
        <button 
          onClick={() => loadMore()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>}

      {/* Movies Grid/List */}
      <div className={gridClasses}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} view={view} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && <div ref={ref} className="h-10" />}
    </div>
  );
} 