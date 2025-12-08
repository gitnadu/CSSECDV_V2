const errorHandler = (err, req, res, next) => {
    // Log error details for debugging (server-side only)
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Generic error messages to avoid information disclosure
    const genericMessages = {
        400: 'Bad Request. Please check your input and try again.',
        401: 'Authentication required. Please log in.',
        403: 'Access denied. You do not have permission to access this resource.',
        404: 'The page you are looking for could not be found.',
        500: 'An internal server error occurred. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.'
    };

    // Use generic message or fall back to a default
    const message = genericMessages[statusCode] || 'An unexpected error occurred.';

    // Render custom error page
    res.status(statusCode).render('error', {
        statusCode,
        message,
        // Don't expose stack traces in production
        showDetails: process.env.NODE_ENV !== 'production'
    });
};

// 404 Not Found handler
const notFoundHandler = (req, res, next) => {
    res.status(404).render('error', {
        statusCode: 404,
        message: 'The page you are looking for could not be found.'
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
