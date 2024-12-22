import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

if (!TMDB_API_KEY || !TMDB_ACCESS_TOKEN) {
  throw new Error('TMDB API key or access token is missing');
}

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
  params: {
    api_key: TMDB_API_KEY,
  },
});

interface TMDBParams {
  language?: string;
  region?: string;
  page?: number;
}

class TMDBService {
  // Movies
  async getMovie(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/movie/${id}`, { params });
    return data;
  }

  async getMovieCredits(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/movie/${id}/credits`, { params });
    return data;
  }

  async getMovieVideos(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/movie/${id}/videos`, { params });
    return data;
  }

  async getPopularMovies(params?: TMDBParams) {
    const { data } = await api.get('/movie/popular', { params });
    return data;
  }

  async getTopRatedMovies(params?: TMDBParams) {
    const { data } = await api.get('/movie/top_rated', { params });
    return data;
  }

  async getUpcomingMovies(params?: TMDBParams) {
    const { data } = await api.get('/movie/upcoming', { params });
    return data;
  }

  async discoverMovies(params?: any) {
    const { data } = await api.get('/discover/movie', { params });
    return data;
  }

  // TV Shows
  async getTVShow(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/tv/${id}`, { params });
    return data;
  }

  async getTVShowCredits(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/tv/${id}/credits`, { params });
    return data;
  }

  async getTVShowVideos(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/tv/${id}/videos`, { params });
    return data;
  }

  async getPopularTVShows(params?: TMDBParams) {
    const { data } = await api.get('/tv/popular', { params });
    return data;
  }

  async getTopRatedTVShows(params?: TMDBParams) {
    const { data } = await api.get('/tv/top_rated', { params });
    return data;
  }

  async discoverTVShows(params?: any) {
    const { data } = await api.get('/discover/tv', { params });
    return data;
  }

  // People
  async getPerson(id: number, params?: TMDBParams) {
    const { data } = await api.get(`/person/${id}`, { params });
    return data;
  }

  async getPopularPeople(params?: TMDBParams) {
    const { data } = await api.get('/person/popular', { params });
    return data;
  }

  // Search
  async searchMovies(params: TMDBParams & { query: string }) {
    const { data } = await api.get('/search/movie', { params });
    return data;
  }

  async searchTVShows(params: TMDBParams & { query: string }) {
    const { data } = await api.get('/search/tv', { params });
    return data;
  }

  async searchPeople(params: TMDBParams & { query: string }) {
    const { data } = await api.get('/search/person', { params });
    return data;
  }

  // User Actions
  async rateMovie(movieId: number, rating: number) {
    const { data } = await api.post(`/movie/${movieId}/rating`, {
      value: rating,
    });
    return data;
  }

  async rateTVShow(tvShowId: number, rating: number) {
    const { data } = await api.post(`/tv/${tvShowId}/rating`, {
      value: rating,
    });
    return data;
  }

  async markAsFavorite(mediaType: 'movie' | 'tv', mediaId: number, favorite: boolean) {
    const { data } = await api.post('/account/{account_id}/favorite', {
      media_type: mediaType,
      media_id: mediaId,
      favorite,
    });
    return data;
  }

  async addToWatchlist(mediaType: 'movie' | 'tv', mediaId: number, watchlist: boolean) {
    const { data } = await api.post('/account/{account_id}/watchlist', {
      media_type: mediaType,
      media_id: mediaId,
      watchlist,
    });
    return data;
  }

  // User Lists
  async getFavoriteMovies(params?: TMDBParams) {
    const { data } = await api.get('/account/{account_id}/favorite/movies', { params });
    return data;
  }

  async getFavoriteTVShows(params?: TMDBParams) {
    const { data } = await api.get('/account/{account_id}/favorite/tv', { params });
    return data;
  }

  async getWatchlistMovies(params?: TMDBParams) {
    const { data } = await api.get('/account/{account_id}/watchlist/movies', { params });
    return data;
  }

  async getWatchlistTVShows(params?: TMDBParams) {
    const { data } = await api.get('/account/{account_id}/watchlist/tv', { params });
    return data;
  }
}

export const tmdbService = new TMDBService(); 