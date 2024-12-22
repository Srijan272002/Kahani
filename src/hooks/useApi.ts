import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type ApiFunction<T, P extends any[]> = (...args: P) => Promise<T>;

export function useApi<T, P extends any[]>(
  apiFn: ApiFunction<T, P>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: options.initialData || null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: P) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const data = await apiFn(...args);
        setState({ data, loading: false, error: null });
        options.onSuccess?.(data);
        return { data, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setState({ data: null, loading: false, error });
        options.onError?.(error);
        return { data: null, error };
      }
    },
    [apiFn, options]
  );

  const reset = useCallback(() => {
    setState({
      data: options.initialData || null,
      loading: false,
      error: null,
    });
  }, [options.initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Example usage:
/*
const {
  data: movies,
  loading,
  error,
  execute: fetchMovies
} = useApi(
  (page: number) => api.getMovies({ page }),
  {
    onSuccess: (data) => {
      console.log('Movies fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to fetch movies:', error);
    }
  }
);

// In your component:
useEffect(() => {
  fetchMovies(1);
}, [fetchMovies]);
*/ 