import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useDebounce } from '../hooks/useDebounce';
import { TVShow, DiscoverTVShowParams } from '../types/api.types';
import { TVShowCard } from '../components/tvshows/TVShowCard';
import { Select } from '../components/common/Select';
import { Toggle } from '../components/common/Toggle';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'first_air_date.desc', label: 'Recently Released' },
  { value: 'name.asc', label: 'Name A-Z' },
] as const;

const yearOptions = Array.from({ length: 50 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'returning', label: 'Returning Series' },
  { value: 'ended', label: 'Ended' },
  { value: 'canceled', label: 'Canceled' },
] as const;

export function TvShows() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<DiscoverTVShowParams>({
    sort_by: searchParams.get('sort_by') || 'popularity.desc',
    first_air_date_year: searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : undefined,
    with_genres: searchParams.get('genres') || undefined,
    with_watch_providers: searchParams.get('providers') || undefined,
    with_status: searchParams.get('status') || undefined,
    include_adult: false,
  });

  const debouncedFilters = useDebounce(filters, 500);
  const { discoverTVShows } = useTMDB();

  const {
    data: tvShows,
    loading,
    error,
    hasMore,
    loadMore,
    ref,
  } = useInfiniteScroll<TVShow>({
    fetchFn: async (page) => {
      const result = await discoverTVShows({ ...debouncedFilters, page });
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
    if (filters.first_air_date_year) params.set('year', filters.first_air_date_year.toString());
    if (filters.with_genres) params.set('genres', filters.with_genres);
    if (filters.with_watch_providers) params.set('providers', filters.with_watch_providers);
    if (filters.with_status) params.set('status', filters.with_status);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = <K extends keyof DiscoverTVShowParams>(
    key: K,
    value: DiscoverTVShowParams[K]
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
            value={filters.first_air_date_year?.toString() || ''}
            onChange={(value) => handleFilterChange('first_air_date_year', value ? parseInt(value) : undefined)}
            options={[{ value: '', label: 'All Years' }, ...yearOptions]}
          />

          <Select
            label="Status"
            value={filters.with_status || ''}
            onChange={(value) => handleFilterChange('with_status', value)}
            options={statusOptions}
          />

          <div className="flex-1" />

          <Toggle
            value={view === 'grid'}
            onChange={(value) => setView(value ? 'grid' : 'list')}
            icons={{
              checked: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              ),
              unchecked: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ),
            }}
          />
        </div>
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error.message} onRetry={() => loadMore()} />}

      {/* TV Shows Grid/List */}
      <div className={gridClasses}>
        {tvShows.map((tvShow) => (
          <TVShowCard key={tvShow.id} tvShow={tvShow} view={view} />
        ))}
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