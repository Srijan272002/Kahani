const { AppError } = require('./errorHandler');
const Joi = require('joi');

const validateSearch = (req, res, next) => {
    const schema = Joi.object({
        q: Joi.string().required().min(1).max(100),
        types: Joi.string().optional(),
        sort: Joi.string().valid('relevance', 'rating', 'latest', 'popularity').optional(),
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(50).optional()
    });

    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid search parameters',
            error: error.details[0].message
        });
    }

    next();
};

const validateAuth = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials',
            error: error.details[0].message
        });
    }

    next();
};

const validateUser = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user data',
            error: error.details[0].message
        });
    }

    next();
};

const validateReview = (req, res, next) => {
    const { rating, itemId, itemType } = req.body;
    
    if (!itemId || !itemType) {
        return next(new AppError('Item ID and type are required', 400));
    }
    
    if (rating < 1 || rating > 5) {
        return next(new AppError('Rating must be between 1 and 5', 400));
    }
    
    next();
};

module.exports = {
    validateSearch,
    validateAuth,
    validateUser,
    validateReview
}; 