import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  initialPage?: number;
  dependencies?: any[];
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialPage = 1,
  dependencies = [],
}: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const { ref, inView } = useInView();

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    reset();
  }, [...dependencies]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, loading, hasMore]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    ref,
  };
}

// Example usage:
/*
const {
  data: movies,
  loading,
  error,
  hasMore,
  ref
} = useInfiniteScroll({
  fetchFn: async (page) => {
    const response = await api.getMovies({ page, pageSize: 20 });
    return {
      data: response.data.movies,
      hasMore: response.data.hasMore
    };
  }
});

// In your JSX:
{movies.map(movie => (
  <MovieCard key={movie.id} movie={movie} />
))}
{hasMore && <div ref={ref}>{loading && 'Loading more...'}</div>}
*/ 