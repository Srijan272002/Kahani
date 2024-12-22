import { randomUUID } from 'crypto';

export const dbUtils = {
  // User operations
  createUser: db => (email, password, name, role = 'USER') => {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const id = randomUUID();
    stmt.run(id, email, password, name, role);
    return id;
  },

  findUserByEmail: db => email => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Wishlist operations
  addToWishlist: db => (userId, mediaId, mediaType, title, year, poster, description) => {
    const stmt = db.prepare(`
      INSERT INTO wishlist (id, user_id, media_id, media_type, title, year, poster, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const id = randomUUID();
    stmt.run(id, userId, mediaId, mediaType, title, year, poster, description);
    return id;
  },

  removeFromWishlist: db => (userId, mediaId) => {
    const stmt = db.prepare('DELETE FROM wishlist WHERE user_id = ? AND media_id = ?');
    return stmt.run(userId, mediaId);
  },

  // Search history operations
  addSearchHistory: db => (userId, query, type) => {
    const stmt = db.prepare(`
      INSERT INTO search_history (id, user_id, query, type)
      VALUES (?, ?, ?, ?)
    `);
    const id = randomUUID();
    stmt.run(id, userId, query, type);
    return id;
  },

  // Comments operations
  addComment: db => (userId, mediaId, content) => {
    const stmt = db.prepare(`
      INSERT INTO comments (id, user_id, media_id, content)
      VALUES (?, ?, ?, ?)
    `);
    const id = randomUUID();
    stmt.run(id, userId, mediaId, content);
    return id;
  },

  // Ratings operations
  upsertRating: db => (userId, mediaId, value) => {
    const stmt = db.prepare(`
      INSERT INTO ratings (id, user_id, media_id, value)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, media_id) DO UPDATE SET value = ?
    `);
    const id = randomUUID();
    stmt.run(id, userId, mediaId, value, value);
    return id;
  }
};