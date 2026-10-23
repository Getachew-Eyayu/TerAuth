"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const institution_routes_js_1 = __importDefault(require("./routes/institution.routes.js"));
const certificate_routes_js_1 = __importDefault(require("./routes/certificate.routes.js"));
const verification_routes_js_1 = __importDefault(require("./routes/verification.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./routes/dashboard.routes.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const requestLogger_middleware_js_1 = require("./middleware/requestLogger.middleware.js");
const csrf_middleware_js_1 = require("./middleware/csrf.middleware.js");
const prisma_js_1 = __importDefault(require("./prisma.js"));
const app = (0, express_1.default)();
// Security Headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5000', 'http://127.0.0.1:5173', 'https://*.vercel.app'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    frameguard: { action: 'sameorigin' },
}));
// CORS Configuration
const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
const defaultDevOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
];
const allowedOrigins = Array.from(new Set([...envOrigins, ...(process.env.NODE_ENV !== 'production' ? defaultDevOrigins : [])]));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, internal server requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Allow any Vercel deployment domain (*.vercel.app)
        if (/^https:\/\/[a-z0-9-]+(\.vercel\.app|\.now\.sh)$/i.test(origin)) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV === 'production') {
            return callback(new Error(`Origin '${origin}' is not permitted by CORS policy`));
        }
        // Permissive with warning in development environments only
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-Id'],
}));
// Correlation ID & Request Logging
app.use(requestLogger_middleware_js_1.requestLogger);
// Body Parser & Cookie Support
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            if (name && rest.length > 0) {
                cookies[name.trim()] = decodeURIComponent(rest.join('='));
            }
        });
    }
    req.cookies = cookies;
    next();
});
// Anti-CSRF Protection
app.use(csrf_middleware_js_1.csrfProtection);
// Health Check - General Status
app.get('/api/health', async (req, res) => {
    let dbStatus = 'connected';
    let dbError = null;
    try {
        await prisma_js_1.default.$queryRaw `SELECT 1`;
    }
    catch (err) {
        dbStatus = 'disconnected';
        dbError = err?.message || String(err);
    }
    const isHealthy = dbStatus === 'connected';
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'TerAuth National Certificate Verification Platform API',
        database: dbStatus,
        error: dbError,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        version: '1.0.0',
    });
});
// Kubernetes / Container Liveness Probe (process is running)
app.get('/api/health/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});
// Kubernetes / Container Readiness Probe (database is ready to serve traffic)
app.get('/api/health/ready', async (req, res) => {
    try {
        await prisma_js_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({ status: 'ready', database: 'connected' });
    }
    catch (error) {
        res.status(503).json({ status: 'unready', database: 'disconnected' });
    }
});
// API Routes
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/institutions', institution_routes_js_1.default);
app.use('/api/certificates', certificate_routes_js_1.default);
app.use('/api/verify', verification_routes_js_1.default);
app.use('/api/verifications', verification_routes_js_1.default);
app.use('/api/users', user_routes_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
// Fallback 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' not found.`,
    });
});
// Centralized Error Handler
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
    module.exports.default = app;
}
