import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const securityMiddleware = [
  // Basic security headers
  helmet(),
  
  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  }),
  
  // CORS headers
  (req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  }
];

export { securityMiddleware }; 