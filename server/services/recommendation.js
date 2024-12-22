const { Configuration, OpenAIApi } = require('openai');
const { prisma } = require('../config/database');
const redis = require('../config/redis');
const tmdb = require('./tmdb');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

class RecommendationService {
    async getPersonalizedRecommendations(userId) {
        try {
            // Get user's A/B test assignment
            const testAssignment = await this.getUserTestAssignment(userId);
            const algorithm = testAssignment ? 
                testAssignment.variant.configuration.algorithm : 
                'hybrid';

            // Track analytics event
            await this.trackAnalyticsEvent(userId, 'recommendation_request', {
                algorithm,
                timestamp: new Date(),
            });

            // Get recommendations based on assigned algorithm
            const recommendations = await this.getRecommendationsByAlgorithm(userId, algorithm);

            // Cache recommendations
            const cacheKey = `recommendations:${userId}`;
            await redis.setex(cacheKey, 86400, JSON.stringify(recommendations));

            // Save recommendation history
            await this.saveRecommendationHistory(userId, recommendations);

            return recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    async getUserTestAssignment(userId) {
        return await prisma.aBTestAssignment.findFirst({
            where: {
                userId,
                test: {
                    status: 'ACTIVE',
                    endDate: {
                        gt: new Date(),
                    },
                },
            },
            include: {
                variant: true,
            },
        });
    }

    async getRecommendationsByAlgorithm(userId, algorithm) {
        switch (algorithm) {
            case 'collaborative':
                return await this.getCollaborativeFilteringRecommendations(userId);
            case 'content':
                return await this.getContentBasedRecommendations(userId);
            case 'contextual':
                return await this.getContextualRecommendations(userId);
            case 'hybrid':
            default:
                return await this.getHybridRecommendations(userId);
        }
    }

    async getCollaborativeFilteringRecommendations(userId) {
        // Get similar users based on ratings and interactions
        const similarUsers = await this.findSimilarUsers(userId);
        
        // Get items liked by similar users
        const recommendations = await this.getRecommendationsFromSimilarUsers(similarUsers);
        
        return this.formatRecommendations(recommendations);
    }

    async getContentBasedRecommendations(userId) {
        // Get user preferences and history
        const userProfile = await this.generateUserProfile(
            await this.getUserHistory(userId),
            await this.getUserPreferences(userId)
        );

        // Find items similar to user's liked items
        const recommendations = await this.findSimilarItems(userProfile);
        
        return this.formatRecommendations(recommendations);
    }

    async getContextualRecommendations(userId) {
        // Get user's current context (time, location, device, etc.)
        const userContext = await this.getUserContext(userId);
        
        // Get recommendations based on context
        const recommendations = await this.getContextualItems(userContext);
        
        return this.formatRecommendations(recommendations);
    }

    async getHybridRecommendations(userId) {
        // Get recommendations from different algorithms
        const [collaborative, content, contextual] = await Promise.all([
            this.getCollaborativeFilteringRecommendations(userId),
            this.getContentBasedRecommendations(userId),
            this.getContextualRecommendations(userId),
        ]);

        // Combine and rank recommendations
        return this.combineAndRankRecommendations([collaborative, content, contextual]);
    }

    async findSimilarUsers(userId) {
        const userRatings = await prisma.review.findMany({
            where: { userId },
            select: { itemId: true, rating: true },
        });

        // Find users with similar ratings
        const similarUsers = await prisma.user.findMany({
            where: {
                reviews: {
                    some: {
                        itemId: { in: userRatings.map(r => r.itemId) },
                    },
                },
            },
            include: {
                reviews: true,
            },
        });

        return similarUsers.map(user => ({
            ...user,
            similarity: this.calculateUserSimilarity(userRatings, user.reviews),
        })).sort((a, b) => b.similarity - a.similarity);
    }

    async getUserContext(userId) {
        const recentHistory = await prisma.history.findMany({
            where: { userId },
            orderBy: { viewedAt: 'desc' },
            take: 10,
        });

        const timeOfDay = new Date().getHours();
        const dayOfWeek = new Date().getDay();

        return {
            recentHistory,
            timeOfDay,
            dayOfWeek,
        };
    }

    async trackAnalyticsEvent(userId, eventType, eventData) {
        await prisma.analyticsEvent.create({
            data: {
                userId,
                eventType,
                eventData,
            },
        });
    }

    async trackRecommendationMetrics(userId, recommendationId, metrics) {
        await prisma.recommendationMetrics.create({
            data: {
                userId,
                recommendationId,
                ...metrics,
            },
        });
    }

    calculateUserSimilarity(userRatings1, userRatings2) {
        const commonItems = userRatings1.filter(r1 => 
            userRatings2.some(r2 => r2.itemId === r1.itemId)
        );

        if (commonItems.length === 0) return 0;

        const differences = commonItems.map(item => {
            const rating2 = userRatings2.find(r => r.itemId === item.itemId)?.rating || 0;
            return Math.pow(item.rating - rating2, 2);
        });

        return 1 / (1 + Math.sqrt(differences.reduce((sum, diff) => sum + diff, 0)));
    }

    combineAndRankRecommendations(recommendationSets) {
        // Combine all recommendations
        const allRecommendations = recommendationSets.flatMap(set => set);

        // Remove duplicates
        const uniqueRecommendations = Array.from(
            new Map(allRecommendations.map(item => [item.id, item])).values()
        );

        // Sort by weighted score
        return {
            movies: this.rankRecommendations(uniqueRecommendations.filter(item => item.type === 'movie')),
            tvShows: this.rankRecommendations(uniqueRecommendations.filter(item => item.type === 'tv')),
            books: this.rankRecommendations(uniqueRecommendations.filter(item => item.type === 'book')),
            crossMedia: this.groupCrossMediaRecommendations(uniqueRecommendations),
        };
    }

    rankRecommendations(items) {
        return items.sort((a, b) => {
            const scoreA = this.calculateRecommendationScore(a);
            const scoreB = this.calculateRecommendationScore(b);
            return scoreB - scoreA;
        });
    }

    calculateRecommendationScore(item) {
        // Combine multiple factors for ranking
        const factors = {
            rating: item.rating || 0,
            popularity: item.popularity || 0,
            recency: this.calculateRecencyScore(item.releaseDate),
            diversity: this.calculateDiversityScore(item),
        };

        return Object.values(factors).reduce((sum, score) => sum + score, 0);
    }

    async getUserHistory(userId) {
        const history = await prisma.userProgress.findMany({
            where: { userId },
            include: {
                movie: true,
                tvShow: true,
                book: true,
                rating: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });

        return history;
    }

    async getUserPreferences(userId) {
        const preferences = await prisma.userPreferences.findUnique({
            where: { userId }
        });

        return preferences;
    }

    async generateUserProfile(history, preferences) {
        // Combine user history and preferences into a text description
        const profileText = this.createUserProfileText(history, preferences);

        // Generate embedding using OpenAI
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: profileText,
        });

        return {
            embedding: response.data.data[0].embedding,
            genres: this.extractPreferredGenres(history),
            ratings: this.calculateAverageRatings(history),
            recentlyViewed: this.getRecentItems(history)
        };
    }

    createUserProfileText(history, preferences) {
        const recentItems = history.slice(0, 10).map(item => {
            const media = item.movie || item.tvShow || item.book;
            return `${media.title} (${media.type}, Rating: ${item.rating?.value || 'N/A'})`;
        }).join(', ');

        const favoriteGenres = preferences.favoriteGenres.join(', ');

        return `User enjoys ${recentItems}. Favorite genres: ${favoriteGenres}. 
                Preferred content rating: ${preferences.contentRating}. 
                Language preference: ${preferences.language}.`;
    }

    async getMovieRecommendations(userProfile) {
        try {
            // Get base recommendations from TMDB
            const recommendations = await tmdb.getRecommendations('movie', {
                genres: userProfile.genres,
                language: userProfile.language,
                page: 1
            });

            // Get user's watch history
            const watchHistory = await prisma.history.findMany({
                where: {
                    userId: userProfile.userId,
                    itemType: 'MOVIE'
                },
                orderBy: { viewedAt: 'desc' },
                take: 50
            });

            // Get user's ratings
            const ratings = await prisma.review.findMany({
                where: {
                    userId: userProfile.userId,
                    itemType: 'MOVIE'
                }
            });

            // Calculate genre preferences
            const genrePreferences = this.calculateGenrePreferences(watchHistory, ratings);

            // Get trending movies
            const trending = await tmdb.getTrending('movie', 'week');

            // Combine and rank recommendations
            const combinedRecommendations = [
                ...recommendations.results,
                ...trending.results
            ].filter((movie, index, self) =>
                index === self.findIndex((m) => m.id === movie.id)
            );

            // Apply sophisticated ranking
            const rankedRecommendations = combinedRecommendations.map(movie => ({
                id: movie.id.toString(),
                title: movie.title,
                type: 'movie',
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                overview: movie.overview,
                releaseDate: movie.release_date,
                rating: movie.vote_average,
                score: this.calculateMovieScore(movie, {
                    genrePreferences,
                    watchHistory,
                    ratings,
                    userProfile
                })
            }));

            return rankedRecommendations.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Error getting movie recommendations:', error);
            throw error;
        }
    }

    async getTvShowRecommendations(userProfile) {
        try {
            // Get base recommendations from TMDB
            const recommendations = await tmdb.getRecommendations('tv', {
                genres: userProfile.genres,
                language: userProfile.language,
                page: 1
            });

            // Get user's watch history
            const watchHistory = await prisma.history.findMany({
                where: {
                    userId: userProfile.userId,
                    itemType: 'TV_SHOW'
                },
                orderBy: { viewedAt: 'desc' },
                take: 50
            });

            // Get user's episode progress
            const episodeProgress = await prisma.episodeProgress.findMany({
                where: {
                    userId: userProfile.userId
                }
            });

            // Calculate show completion rates
            const completionRates = this.calculateShowCompletionRates(episodeProgress);

            // Get trending shows
            const trending = await tmdb.getTrending('tv', 'week');

            // Combine and rank recommendations
            const combinedRecommendations = [
                ...recommendations.results,
                ...trending.results
            ].filter((show, index, self) =>
                index === self.findIndex((s) => s.id === show.id)
            );

            // Apply sophisticated ranking
            const rankedRecommendations = combinedRecommendations.map(show => ({
                id: show.id.toString(),
                title: show.name,
                type: 'tv',
                poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
                overview: show.overview,
                releaseDate: show.first_air_date,
                rating: show.vote_average,
                score: this.calculateTvShowScore(show, {
                    watchHistory,
                    completionRates,
                    userProfile
                })
            }));

            return rankedRecommendations.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Error getting TV show recommendations:', error);
            throw error;
        }
    }

    async getBookRecommendations(userProfile) {
        try {
            // Get user's reading history
            const readingHistory = await prisma.history.findMany({
                where: {
                    userId: userProfile.userId,
                    itemType: 'BOOK'
                },
                orderBy: { viewedAt: 'desc' },
                take: 50
            });

            // Get user's book ratings
            const ratings = await prisma.review.findMany({
                where: {
                    userId: userProfile.userId,
                    itemType: 'BOOK'
                }
            });

            // Calculate author and genre preferences
            const authorPreferences = this.calculateAuthorPreferences(readingHistory, ratings);
            const genrePreferences = this.calculateGenrePreferences(readingHistory, ratings);

            // Get recommendations from Google Books API
            const recommendations = await this.getBookRecommendationsFromAPI(
                userProfile,
                authorPreferences,
                genrePreferences
            );

            // Apply sophisticated ranking
            const rankedRecommendations = recommendations.map(book => ({
                ...book,
                score: this.calculateBookScore(book, {
                    readingHistory,
                    ratings,
                    authorPreferences,
                    genrePreferences,
                    userProfile
                })
            }));

            return rankedRecommendations.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Error getting book recommendations:', error);
            throw error;
        }
    }

    calculateMovieScore(movie, context) {
        const {
            genrePreferences,
            watchHistory,
            ratings,
            userProfile
        } = context;

        const weights = {
            genreMatch: 0.3,
            rating: 0.2,
            popularity: 0.15,
            recency: 0.15,
            userRatingHistory: 0.2
        };

        // Calculate genre match score
        const genreMatchScore = this.calculateGenreMatchScore(movie.genre_ids, genrePreferences);

        // Calculate rating score
        const ratingScore = (movie.vote_average / 10) * weights.rating;

        // Calculate popularity score
        const popularityScore = (movie.popularity / 1000) * weights.popularity;

        // Calculate recency score
        const recencyScore = this.calculateRecencyScore(movie.release_date) * weights.recency;

        // Calculate user rating history score
        const userRatingScore = this.calculateUserRatingScore(movie, ratings) * weights.userRatingHistory;

        return (
            genreMatchScore * weights.genreMatch +
            ratingScore +
            popularityScore +
            recencyScore +
            userRatingScore
        );
    }

    calculateTvShowScore(show, context) {
        const {
            watchHistory,
            completionRates,
            userProfile
        } = context;

        const weights = {
            genreMatch: 0.25,
            rating: 0.2,
            popularity: 0.15,
            recency: 0.15,
            completionRate: 0.25
        };

        // Calculate genre match score
        const genreMatchScore = this.calculateGenreMatchScore(show.genre_ids, userProfile.genres);

        // Calculate rating score
        const ratingScore = (show.vote_average / 10) * weights.rating;

        // Calculate popularity score
        const popularityScore = (show.popularity / 1000) * weights.popularity;

        // Calculate recency score
        const recencyScore = this.calculateRecencyScore(show.first_air_date) * weights.recency;

        // Calculate completion rate score
        const completionScore = this.calculateCompletionScore(show, completionRates) * weights.completionRate;

        return (
            genreMatchScore * weights.genreMatch +
            ratingScore +
            popularityScore +
            recencyScore +
            completionScore
        );
    }

    calculateBookScore(book, context) {
        const {
            readingHistory,
            ratings,
            authorPreferences,
            genrePreferences,
            userProfile
        } = context;

        const weights = {
            authorMatch: 0.25,
            genreMatch: 0.25,
            rating: 0.2,
            popularity: 0.15,
            recency: 0.15
        };

        // Calculate author match score
        const authorMatchScore = this.calculateAuthorMatchScore(book.authors, authorPreferences);

        // Calculate genre match score
        const genreMatchScore = this.calculateGenreMatchScore(book.categories, genrePreferences);

        // Calculate rating score
        const ratingScore = (book.averageRating / 5) * weights.rating;

        // Calculate popularity score
        const popularityScore = Math.min(book.ratingsCount / 10000, 1) * weights.popularity;

        // Calculate recency score
        const recencyScore = this.calculateRecencyScore(book.publishedDate) * weights.recency;

        return (
            authorMatchScore * weights.authorMatch +
            genreMatchScore * weights.genreMatch +
            ratingScore +
            popularityScore +
            recencyScore
        );
    }

    calculateGenreMatchScore(itemGenres, userGenres) {
        if (!itemGenres || !userGenres) return 0;
        const matchingGenres = itemGenres.filter(g => userGenres.includes(g));
        return matchingGenres.length / Math.max(itemGenres.length, 1);
    }

    calculateAuthorMatchScore(authors, authorPreferences) {
        if (!authors || !authorPreferences) return 0;
        return authors.reduce((score, author) => {
            return score + (authorPreferences[author] || 0);
        }, 0) / authors.length;
    }

    calculateRecencyScore(date) {
        if (!date) return 0;
        const now = new Date();
        const itemDate = new Date(date);
        const ageInYears = (now - itemDate) / (1000 * 60 * 60 * 24 * 365);
        return Math.max(0, 1 - ageInYears / 10); // Decay over 10 years
    }

    calculateUserRatingScore(item, ratings) {
        if (!ratings || !ratings.length) return 0.5; // Neutral score if no ratings
        const similarItemRatings = ratings.filter(r => 
            r.itemType === item.type && 
            this.calculateGenreMatchScore(item.genre_ids, r.genres) > 0.5
        );
        if (!similarItemRatings.length) return 0.5;
        return similarItemRatings.reduce((sum, r) => sum + r.rating, 0) / (similarItemRatings.length * 5);
    }

    calculateCompletionScore(show, completionRates) {
        if (!completionRates || !Object.keys(completionRates).length) return 0.5;
        const similarShows = Object.entries(completionRates).filter(([id, rate]) => 
            this.calculateGenreMatchScore(show.genre_ids, completionRates[id].genres) > 0.5
        );
        if (!similarShows.length) return 0.5;
        return similarShows.reduce((sum, [, rate]) => sum + rate.completion, 0) / similarShows.length;
    }

    getCrossMediaRecommendations(allRecommendations, userProfile) {
        // Sort all recommendations by similarity score
        const sortedRecs = allRecommendations
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);

        // Group similar items across media types
        const groups = this.groupSimilarItems(sortedRecs);

        return groups.map(group => ({
            theme: this.identifyTheme(group),
            items: group
        }));
    }

    calculateSimilarity(item, userProfile) {
        // Implement cosine similarity between item and user profile
        const itemFeatures = [
            item.vote_average || item.averageRating || 0,
            item.popularity || 0,
            item.genre_ids?.length || item.categories?.length || 0
        ];

        const userFeatures = [
            userProfile.ratings.average,
            userProfile.ratings.count,
            userProfile.genres.length
        ];

        return this.cosineSimilarity(itemFeatures, userFeatures);
    }

    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    groupSimilarItems(items) {
        // Group items based on genre overlap and themes
        const groups = [];
        const used = new Set();

        for (const item of items) {
            if (used.has(item.id)) continue;

            const group = [item];
            used.add(item.id);

            for (const other of items) {
                if (used.has(other.id)) continue;
                if (this.areItemsSimilar(item, other)) {
                    group.push(other);
                    used.add(other.id);
                }
            }

            if (group.length > 1) {
                groups.push(group);
            }
        }

        return groups;
    }

    areItemsSimilar(item1, item2) {
        // Check if items share genres or themes
        const genres1 = new Set(item1.genres || []);
        const genres2 = new Set(item2.genres || []);
        const commonGenres = [...genres1].filter(g => genres2.has(g));
        return commonGenres.length > 0;
    }

    identifyTheme(group) {
        // Identify common theme among grouped items
        const allGenres = group.flatMap(item => item.genres || []);
        const genreCounts = allGenres.reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});

        const mostCommonGenre = Object.entries(genreCounts)
            .sort(([,a], [,b]) => b - a)[0][0];

        return `Based on your interest in ${mostCommonGenre}`;
    }

    async saveRecommendationHistory(userId, recommendations) {
        await prisma.recommendationHistory.create({
            data: {
                userId,
                recommendations: JSON.stringify(recommendations),
                generatedAt: new Date()
            }
        });
    }

    async getRecommendationHistory(userId) {
        const history = await prisma.recommendationHistory.findMany({
            where: { userId },
            orderBy: { generatedAt: 'desc' },
            take: 10
        });

        return history.map(record => ({
            ...record,
            recommendations: JSON.parse(record.recommendations)
        }));
    }
}

module.exports = new RecommendationService(); 