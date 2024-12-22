import { useState } from 'react';
import { api } from '../services/api';
import type { MediaItem, MediaType, SearchResults } from '../types';

export function useSearch() {
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, type: MediaType) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.search(query, type);
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}