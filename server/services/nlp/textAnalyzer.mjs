import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let natural;
try {
    natural = require('natural');
} catch (error) {
    console.error('Failed to load natural package:', error);
    natural = {
        WordTokenizer: class MockTokenizer {
            tokenize(text) { return text.split(/\s+/); }
        },
        TfIdf: class MockTfIdf {
            addDocument() {}
            listTerms() { return []; }
        },
        PorterStemmer: {
            stem: word => word
        },
        SentimentAnalyzer: class MockSentimentAnalyzer {
            getSentiment() { return 0; }
        }
    };
}

import { stopwords } from './stopwords.mjs';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;

export class TextAnalyzer {
    constructor() {
        try {
            this.tfidf = new TfIdf();
            this.sentimentAnalyzer = new natural.SentimentAnalyzer(
                'English',
                stemmer,
                'afinn'
            );
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize TextAnalyzer:', error);
            this.isInitialized = false;
        }
    }

    analyzeText(text) {
        if (!this.isInitialized) {
            console.warn('TextAnalyzer not properly initialized, returning basic analysis');
            return {
                tokens: text.split(/\s+/),
                stems: text.split(/\s+/),
                sentiment: 0,
                entities: [],
                keywords: []
            };
        }

        try {
            const tokens = this.tokenize(text);
            const stems = this.stem(tokens);
            const sentiment = this.analyzeSentiment(text);
            const entities = this.extractEntities(text);
            const keywords = this.extractKeywords(text);

            return {
                tokens,
                stems,
                sentiment,
                entities,
                keywords
            };
        } catch (error) {
            console.error('Error analyzing text:', error);
            return {
                tokens: [],
                stems: [],
                sentiment: 0,
                entities: [],
                keywords: [],
                error: error.message
            };
        }
    }

    tokenize(text) {
        if (!text) return [];
        return tokenizer
            .tokenize(text.toLowerCase())
            .filter(token => !stopwords.has(token));
    }

    stem(tokens) {
        if (!tokens || !Array.isArray(tokens)) return [];
        return tokens.map(token => stemmer.stem(token));
    }

    analyzeSentiment(text) {
        if (!text) return 0;
        try {
            const tokens = this.tokenize(text);
            return this.sentimentAnalyzer.getSentiment(tokens);
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return 0;
        }
    }

    extractEntities(text) {
        if (!text) return [];
        try {
            const entities = new Set();
            const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
            matches.forEach(match => entities.add(match));
            return Array.from(entities);
        } catch (error) {
            console.error('Error extracting entities:', error);
            return [];
        }
    }

    extractKeywords(text) {
        if (!text) return [];
        try {
            this.tfidf.addDocument(text);
            const terms = [];

            this.tfidf.listTerms(0).forEach(item => {
                if (item.tfidf > 0.5) {
                    terms.push({ term: item.term, score: item.tfidf });
                }
            });

            return terms;
        } catch (error) {
            console.error('Error extracting keywords:', error);
            return [];
        }
    }
}