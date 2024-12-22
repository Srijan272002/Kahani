import axios from 'axios';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const bookRouter = {
  async search(query) {
    try {
      const response = await axios.get(GOOGLE_BOOKS_API_URL, {
        params: {
          q: query,
          maxResults: 10,
        },
      });

      return {
        results: response.data.items.map(book => ({
          id: book.id,
          title: book.volumeInfo.title,
          type: 'book',
          year: book.volumeInfo.publishedDate?.substring(0, 4) || 'N/A',
          poster: book.volumeInfo.imageLinks?.thumbnail,
          description: book.volumeInfo.description,
        })),
        totalResults: response.data.totalItems,
      };
    } catch (error) {
      throw new Error('Failed to fetch books: ' + error.message);
    }
  },
};