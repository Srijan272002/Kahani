import axios from 'axios';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

class TMDBService {
    constructor() {
        // Get environment variables
        this.apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;
        this.accessToken = process.env.TMDB_ACCESS_TOKEN || process.env.VITE_TMDB_ACCESS_TOKEN;
        this.baseURL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
        
        // Validate credentials
        if (!this.apiKey || !this.accessToken) {
            console.error('Missing TMDB credentials');
            if (process.env.NODE_ENV === 'development') {
                // Use mock data in development
                return;
            } else {
                throw new Error('Missing TMDB credentials');
            }
        }

        console.log('TMDB Service Configuration:', {
            baseURL: this.baseURL,
            apiKey: '***' + this.apiKey.slice(-4),
            accessToken: '***' + this.accessToken.slice(-4)
        });

        this.client = axios.create({
            baseURL: this.baseURL,
            params: {
                api_key: this.apiKey,
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                const { api_key, ...logParams } = config.params || {};
                console.log('Making TMDB request:', {
                    method: config.method,
                    url: config.url,
                    params: logParams
                });
                return config;
            },
            (error) => {
                console.error('TMDB request error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('TMDB API error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    config: {
                        method: error.config?.method,
                        url: error.config?.url
                    }
                });
                return Promise.reject(error);
            }
        );
    }

    async getMovie(movieId) {
        try {
            const response = await this.client.get(`/movie/${movieId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching movie:', error.response?.data || error.message);
            throw new Error('Failed to fetch movie details');
        }
    }

    async searchMovies(query, page = 1) {
        try {
            const response = await this.client.get('/search/movie', {
                params: {
                    query,
                    page,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error searching movies:', error.response?.data || error.message);
            throw new Error('Failed to search movies');
        }
    }

    async getPopularMovies(page = 1) {
        try {
            console.log('Fetching popular movies...');
            const response = await this.client.get('/movie/popular', {
                params: { page },
            });
            console.log('Popular movies response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching popular movies:', error.response?.data || error.message);
            if (process.env.NODE_ENV === 'development') {
                return { results: [] };
            }
            throw new Error('Failed to fetch popular movies');
        }
    }

    async getMovieRecommendations(movieId, page = 1) {
        try {
            const response = await this.client.get(`/movie/${movieId}/recommendations`, {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching movie recommendations:', error.response?.data || error.message);
            if (process.env.NODE_ENV === 'development') {
                return { results: [] };
            }
            throw new Error('Failed to fetch movie recommendations');
        }
    }

    async getPopularTVShows(page = 1) {
        try {
            console.log('Fetching popular TV shows...');
            const response = await this.client.get('/tv/popular', {
                params: { page },
            });
            console.log('Popular TV shows response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching popular TV shows:', error.response?.data || error.message);
            if (process.env.NODE_ENV === 'development') {
                return { results: [] };
            }
            throw new Error('Failed to fetch popular TV shows');
        }
    }

    async getTVShowRecommendations(tvShowId, page = 1) {
        try {
            const response = await this.client.get(`/tv/${tvShowId}/recommendations`, {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching TV show recommendations:', error.response?.data || error.message);
            if (process.env.NODE_ENV === 'development') {
                return { results: [] };
            }
            throw new Error('Failed to fetch TV show recommendations');
        }
    }
}

// Create and export the service
const tmdbService = new TMDBService();
export default tmdbService; 