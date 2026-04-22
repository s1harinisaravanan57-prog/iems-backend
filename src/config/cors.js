// src/config/cors.js
// CORS configuration for development and production

const isDev = process.env.NODE_ENV !== 'production';

// Allowed origins for CORS
const allowedOrigins = isDev
    ? [
        'http://localhost:3000',
        'http://localhost:5173',   // Vite dev server
        'http://localhost:3001',   // Alternative frontend port
        'http://127.0.0.1:3000',
    ]
    : [
        'https://iems-backend.onrender.com',  // Your deployed app
        'https://yourdomain.com',              // Your custom domain (update this)
        // Add more production domains as needed
    ];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (isDev) {
            // In development, be more lenient
            callback(null, true);
        } else {
            // In production, strictly enforce CORS
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,                    // Allow credentials (cookies, auth headers)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,                         // 1 hour
};

module.exports = corsOptions;
