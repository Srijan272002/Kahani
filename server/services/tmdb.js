const axios = require('axios');

class TMDBService {
    constructor() {
        this.apiKey = process.env.TMDB_API_KEY;
        this.baseURL = process.env.TMDB_API_BASE_URL;
        this.client = axios.create({
            baseURL: this.baseURL,
            params: {
                api_key: this.apiKey,
            },
        });
    }

    async getMovie(movieId) {
        try {
            const response = await this.client.get(`/movie/${movieId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching movie:', error);
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
            console.error('Error searching movies:', error);
            throw new Error('Failed to search movies');
        }
    }

    async getPopularMovies(page = 1) {
        try {
            const response = await this.client.get('/movie/popular', {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
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
            console.error('Error fetching movie recommendations:', error);
            throw new Error('Failed to fetch movie recommendations');
        }
    }
}

module.exports = new TMDBService(); 