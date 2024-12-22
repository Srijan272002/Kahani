import { useState, useEffect } from 'react';
import type { MediaItem } from '../types';

const MOCK_DATA: Record<string, MediaItem[]> = {
  top: [
    {
      id: '1',
      title: 'The Godfather',
      type: 'movie',
      year: '1972',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      rating: 9.2,
    },
    {
      id: '2',
      title: 'Inception',
      type: 'movie',
      year: '2010',
      poster: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      rating: 8.8,
    }
  ],
  books: [
    {
      id: '3',
      title: 'Project Hail Mary',
      type: 'book',
      year: '2021',
      poster: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      rating: 4.8,
    },
    {
      id: '4',
      title: 'The Midnight Library',
      type: 'book',
      year: '2020',
      poster: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      rating: 4.5,
    }
  ],
  movies: [
    {
      id: '5',
      title: 'Oppenheimer',
      type: 'movie',
      year: '2023',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      rating: 8.5,
    },
    {
      id: '6',
      title: 'Dune: Part Two',
      type: 'movie',
      year: '2024',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      rating: 9.0,
    }
  ],
  tv: [
    {
      id: '7',
      title: 'The Last of Us',
      type: 'tv',
      year: '2023',
      poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500',
      rating: 9.5,
    },
    {
      id: '8',
      title: 'House of the Dragon',
      type: 'tv',
      year: '2022',
      poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500',
      rating: 8.9,
    }
  ],
};

export function useRecommendations() {
  const [topRecommendations, setTopRecommendations] = useState<MediaItem[]>([]);
  const [bookRecommendations, setBookRecommendations] = useState<MediaItem[]>([]);
  const [movieRecommendations, setMovieRecommendations] = useState<MediaItem[]>([]);
  const [tvRecommendations, setTvRecommendations] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // In a real app, these would be API calls
        // For now, using mock data
        setTopRecommendations(MOCK_DATA.top);
        setBookRecommendations(MOCK_DATA.books);
        setMovieRecommendations(MOCK_DATA.movies);
        setTvRecommendations(MOCK_DATA.tv);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return {
    topRecommendations,
    bookRecommendations,
    movieRecommendations,
    tvRecommendations,
    loading,
    error,
  };
}