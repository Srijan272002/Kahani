import { useCallback, useState } from 'react';
import {
  Movie,
  TVShow,
  Person,
  MovieDetails,
  TVShowDetails,
  PersonDetails,
  PaginatedResponse,
  DiscoverMovieParams,
} from '../types/api.types';
import { tmdbService } from '../services/tmdb';

export function useTMDB() {
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [currentRegion, setCurrentRegion] = useState('US');

  // Configuration
  const setLanguage = useCallback((newLanguage: string) => {
    setCurrentLanguage(newLanguage);
  }, []);

  const setRegion = useCallback((newRegion: string) => {
    setCurrentRegion(newRegion);
  }, []);

  // Movies
  const getMovie = useCallback(async (id: number): Promise<MovieDetails> => {
    return tmdbService.getMovie(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getMovieCredits = useCallback(async (id: number) => {
    return tmdbService.getMovieCredits(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getMovieVideos = useCallback(async (id: number) => {
    return tmdbService.getMovieVideos(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getPopularMovies = useCallback(async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.getPopularMovies({ page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const getTopRatedMovies = useCallback(async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.getTopRatedMovies({ page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const getUpcomingMovies = useCallback(async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.getUpcomingMovies({ page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const discoverMovies = useCallback(async (params: DiscoverMovieParams): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.discoverMovies({ ...params, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  // TV Shows
  const getTVShow = useCallback(async (id: number): Promise<TVShowDetails> => {
    return tmdbService.getTVShow(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getTVShowCredits = useCallback(async (id: number) => {
    return tmdbService.getTVShowCredits(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getTVShowVideos = useCallback(async (id: number) => {
    return tmdbService.getTVShowVideos(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getPopularTVShows = useCallback(async (page: number = 1): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.getPopularTVShows({ page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const getTopRatedTVShows = useCallback(async (page: number = 1): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.getTopRatedTVShows({ page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const discoverTVShows = useCallback(async (params: any): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.discoverTVShows({ ...params, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  // People
  const getPerson = useCallback(async (id: number): Promise<PersonDetails> => {
    return tmdbService.getPerson(id, { language: currentLanguage });
  }, [currentLanguage]);

  const getPopularPeople = useCallback(async (page: number = 1): Promise<PaginatedResponse<Person>> => {
    return tmdbService.getPopularPeople({ page, language: currentLanguage });
  }, [currentLanguage]);

  // Search
  const searchMovies = useCallback(async (query: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.searchMovies({ query, page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const searchTVShows = useCallback(async (query: string, page: number = 1): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.searchTVShows({ query, page, language: currentLanguage, region: currentRegion });
  }, [currentLanguage, currentRegion]);

  const searchPeople = useCallback(async (query: string, page: number = 1): Promise<PaginatedResponse<Person>> => {
    return tmdbService.searchPeople({ query, page, language: currentLanguage });
  }, [currentLanguage]);

  // User Actions
  const rateMovie = useCallback(async (movieId: number, rating: number) => {
    return tmdbService.rateMovie(movieId, rating);
  }, []);

  const rateTVShow = useCallback(async (tvShowId: number, rating: number) => {
    return tmdbService.rateTVShow(tvShowId, rating);
  }, []);

  const markAsFavorite = useCallback(async (mediaType: 'movie' | 'tv', mediaId: number, favorite: boolean) => {
    return tmdbService.markAsFavorite(mediaType, mediaId, favorite);
  }, []);

  const addToWatchlist = useCallback(async (mediaType: 'movie' | 'tv', mediaId: number, watchlist: boolean) => {
    return tmdbService.addToWatchlist(mediaType, mediaId, watchlist);
  }, []);

  // User Lists
  const getFavoriteMovies = useCallback(async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.getFavoriteMovies({ page, language: currentLanguage });
  }, [currentLanguage]);

  const getFavoriteTVShows = useCallback(async (page: number = 1): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.getFavoriteTVShows({ page, language: currentLanguage });
  }, [currentLanguage]);

  const getWatchlistMovies = useCallback(async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    return tmdbService.getWatchlistMovies({ page, language: currentLanguage });
  }, [currentLanguage]);

  const getWatchlistTVShows = useCallback(async (page: number = 1): Promise<PaginatedResponse<TVShow>> => {
    return tmdbService.getWatchlistTVShows({ page, language: currentLanguage });
  }, [currentLanguage]);

  return {
    // Configuration
    currentLanguage,
    currentRegion,
    setLanguage,
    setRegion,

    // Movies
    getMovie,
    getMovieCredits,
    getMovieVideos,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    discoverMovies,

    // TV Shows
    getTVShow,
    getTVShowCredits,
    getTVShowVideos,
    getPopularTVShows,
    getTopRatedTVShows,
    discoverTVShows,

    // People
    getPerson,
    getPopularPeople,

    // Search
    searchMovies,
    searchTVShows,
    searchPeople,

    // User Lists
    getFavoriteMovies,
    getFavoriteTVShows,
    getWatchlistMovies,
    getWatchlistTVShows,

    // User Actions
    rateMovie,
    rateTVShow,
    markAsFavorite,
    addToWatchlist,
  };
} 