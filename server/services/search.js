const { Configuration, OpenAIApi } = require('openai');
const { prisma } = require('../config/database');
const redis = require('../config/redis');
const tmdb = require('./tmdb');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class SearchService {
    async generateEmbedding(text) {
        try {
            const response = await openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: text.trim(),
            });
            return response.data.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    async searchMovies(query, embedding) {
        const movieResults = await tmdb.searchMovies(query);
        return movieResults.results.map(movie => ({
            id: movie.id.toString(),
            title: movie.title,
            type: 'movie',
            year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            description: movie.overview,
            rating: movie.vote_average,
            genre: movie.genre_ids
        }));
    }

    async searchTvShows(query, embedding) {
        const tvResults = await tmdb.searchTvShows(query);
        return tvResults.results.map(show => ({
            id: show.id.toString(),
            title: show.name,
            type: 'tv',
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
            poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
            description: show.overview,
            rating: show.vote_average,
            genre: show.genre_ids
        }));
    }

    async searchBooks(query, embedding) {
        // Implement Google Books API search here
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();

        return data.items?.map(book => ({
            id: book.id,
            title: book.volumeInfo.title,
            type: 'book',
            year: book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.substring(0, 4) : '',
            poster: book.volumeInfo.imageLinks?.thumbnail || null,
            description: book.volumeInfo.description,
            rating: book.volumeInfo.averageRating,
            genre: book.volumeInfo.categories || []
        })) || [];
    }

    async search(query, types = [], sort = 'relevance') {
        const cacheKey = `search:${query}:${types.join(',')}:${sort}`;
        
        // Try to get cached results
        const cachedResults = await redis.get(cacheKey);
        if (cachedResults) {
            return JSON.parse(cachedResults);
        }

        try {
            // Generate embedding for semantic search
            const embedding = await this.generateEmbedding(query);

            // Perform parallel searches based on selected types
            const searchPromises = [];
            const selectedTypes = types.length > 0 ? types : ['movie', 'tv', 'book'];

            if (selectedTypes.includes('movie')) {
                searchPromises.push(this.searchMovies(query, embedding));
            }
            if (selectedTypes.includes('tv')) {
                searchPromises.push(this.searchTvShows(query, embedding));
            }
            if (selectedTypes.includes('book')) {
                searchPromises.push(this.searchBooks(query, embedding));
            }

            // Wait for all search promises to resolve
            const results = await Promise.all(searchPromises);
            let combinedResults = results.flat();

            // Sort results
            combinedResults = this.sortResults(combinedResults, sort);

            const response = {
                results: combinedResults,
                totalResults: combinedResults.length
            };

            // Cache results for 15 minutes
            await redis.setex(cacheKey, 900, JSON.stringify(response));

            return response;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    sortResults(results, sortBy) {
        switch (sortBy) {
            case 'rating':
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'latest':
                return results.sort((a, b) => (b.year || '0') - (a.year || '0'));
            case 'popularity':
                // For now, we'll use rating as a proxy for popularity
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'relevance':
            default:
                // Keep original order (which is typically relevance-based from the APIs)
                return results;
        }
    }

    async getSuggestions(query) {
        const cacheKey = `suggestions:${query}`;
        
        // Try to get cached suggestions
        const cachedSuggestions = await redis.get(cacheKey);
        if (cachedSuggestions) {
            return JSON.parse(cachedSuggestions);
        }

        try {
            const [movieSuggestions, tvSuggestions, bookSuggestions] = await Promise.all([
                this.getMovieSuggestions(query),
                this.getTvShowSuggestions(query),
                this.getBookSuggestions(query)
            ]);

            const suggestions = [
                ...movieSuggestions.map(item => ({ ...item, type: 'movie' })),
                ...tvSuggestions.map(item => ({ ...item, type: 'tv' })),
                ...bookSuggestions.map(item => ({ ...item, type: 'book' }))
            ]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10);

            // Cache suggestions for 5 minutes
            await redis.setex(cacheKey, 300, JSON.stringify(suggestions));

            return suggestions;
        } catch (error) {
            console.error('Error getting suggestions:', error);
            throw error;
        }
    }

    async getMovieSuggestions(query) {
        const results = await tmdb.searchMovies(query, { limit: 5 });
        return results.results.map(movie => ({
            id: movie.id.toString(),
            title: movie.title,
            year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : null,
            popularity: movie.popularity
        }));
    }

    async getTvShowSuggestions(query) {
        const results = await tmdb.searchTvShows(query, { limit: 5 });
        return results.results.map(show => ({
            id: show.id.toString(),
            title: show.name,
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : '',
            poster: show.poster_path ? `https://image.tmdb.org/t/p/w92${show.poster_path}` : null,
            popularity: show.popularity
        }));
    }

    async getBookSuggestions(query) {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();

        return data.items?.map(book => ({
            id: book.id,
            title: book.volumeInfo.title,
            year: book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.substring(0, 4) : '',
            poster: book.volumeInfo.imageLinks?.smallThumbnail || null,
            popularity: book.volumeInfo.ratingsCount || 0
        })) || [];
    }
}

module.exports = new SearchService(); 