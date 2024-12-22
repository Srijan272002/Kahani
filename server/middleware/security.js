const helmet = require('helmet');

const securityMiddleware = [
    helmet(),
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.themoviedb.org"]
        }
    }),
    helmet.referrerPolicy({ policy: 'same-origin' })
];

module.exports = securityMiddleware; 