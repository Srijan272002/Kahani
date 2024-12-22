import { prisma } from '../config/database.mjs';
import { TextAnalyzer } from './nlp/textAnalyzer.mjs';

class RecommendationEngine {
    constructor() {
        this.textAnalyzer = new TextAnalyzer();
    }

    async getRecommendations(userId, type = 'all') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    preferences: true,
                    watchHistory: true
                }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Get user preferences and history
            const preferences = user.preferences || {};
            const watchHistory = user.watchHistory || [];

            // Get recommendations based on type
            switch (type.toLowerCase()) {
                case 'movie':
                    return this.getMovieRecommendations(preferences, watchHistory);
                case 'tv':
                    return this.getTVRecommendations(preferences, watchHistory);
                case 'all':
                default:
                    const [movies, tv] = await Promise.all([
                        this.getMovieRecommendations(preferences, watchHistory),
                        this.getTVRecommendations(preferences, watchHistory)
                    ]);
                    return [...movies, ...tv];
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return [];
        }
    }

    async getMovieRecommendations(preferences, watchHistory) {
        try {
            const movies = await prisma.movie.findMany({
                where: {
                    NOT: {
                        id: {
                            in: watchHistory.map(h => h.movieId).filter(Boolean)
                        }
                    },
                    genres: {
                        hasSome: preferences.favoriteGenres || []
                    }
                },
                take: 10,
                orderBy: {
                    rating: 'desc'
                }
            });

            return movies.map(movie => ({
                id: movie.id,
                title: movie.title,
                type: 'movie',
                poster: movie.posterPath,
                rating: movie.rating
            }));
        } catch (error) {
            console.error('Error getting movie recommendations:', error);
            return [];
        }
    }

    async getTVRecommendations(preferences, watchHistory) {
        try {
            const shows = await prisma.tvShow.findMany({
                where: {
                    NOT: {
                        id: {
                            in: watchHistory.map(h => h.tvShowId).filter(Boolean)
                        }
                    },
                    genres: {
                        hasSome: preferences.favoriteGenres || []
                    }
                },
                take: 10,
                orderBy: {
                    rating: 'desc'
                }
            });

            return shows.map(show => ({
                id: show.id,
                title: show.title,
                type: 'tv',
                poster: show.posterPath,
                rating: show.rating
            }));
        } catch (error) {
            console.error('Error getting TV recommendations:', error);
            return [];
        }
    }
}

export const recommendationEngine = new RecommendationEngine();