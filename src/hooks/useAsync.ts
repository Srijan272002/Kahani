import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncFn<T, Args extends any[]> = (...args: Args) => Promise<T>;

export function useAsync<T, Args extends any[]>(
  asyncFn: AsyncFn<T, Args>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  } = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setState({ data: null, loading: true, error: null });
        const data = await asyncFn(...args);
        setState({ data, loading: false, error: null });

        if (options.showSuccessToast) {
          toast.success(options.successMessage || 'Operation successful');
        }

        options.onSuccess?.(data);
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('An error occurred');
        setState({ data: null, loading: false, error: errorObj });

        if (options.showErrorToast) {
          toast.error(errorObj.message);
        }

        options.onError?.(errorObj);
        throw errorObj;
      }
    },
    [asyncFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

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
} = useAsync(
  () => api.getMovies(),
  {
    showErrorToast: true,
    onSuccess: (data) => console.log('Movies fetched:', data)
  }
);
*/ 