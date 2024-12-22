import { AppError } from './errorHandler.mjs';
import config from '../config/config.mjs';

// Custom error class for operational errors
class OperationalError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler for async routes
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Main error handling middleware
export const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific types of errors
  let error = { ...err };
  error.message = err.message;

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new OperationalError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new OperationalError('Token expired', 401);
  }

  // Send error response
  const response = {
    status: error.status || 'error',
    message: error.message,
    ...(config.env === 'development' && {
      error: err,
      stack: err.stack
    }),
    ...(error.errors && { errors: error.errors })
  };

  res.status(error.statusCode || 500).json(response);
};

// Handle Prisma specific errors
const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      return new OperationalError('Duplicate field value', 400);
    case 'P2014':
      return new OperationalError('Invalid ID', 400);
    case 'P2003':
      return new OperationalError('Invalid input data', 400);
    default:
      return new OperationalError('Database error', 500);
  }
};

// Handle duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new OperationalError(
    `Duplicate field value: ${field}. Please use another value`,
    400
  );
};

// Handle validation errors
export const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new OperationalError(`Invalid input data: ${errors.join('. ')}`, 400);
};

// Global promise rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Global exception handler
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
}); 