"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_js_1 = __importDefault(require("./app.js"));
const prisma_js_1 = __importDefault(require("./prisma.js"));
const auth_service_js_1 = require("./services/auth.service.js");
// Export the Express app so Vercel can invoke it as a serverless function.
exports.default = app_js_1.default;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app_js_1.default;
    module.exports.default = app_js_1.default;
}
const PORT = process.env.PORT || 5000;
async function bootstrap() {
    try {
        // Validate required authentication configuration
        (0, auth_service_js_1.validateJwtConfiguration)();
        // Test database connection
        await prisma_js_1.default.$connect();
        console.log(' Successfully connected to TerAuth database.');
        const server = app_js_1.default.listen(PORT, () => {
            console.log(` TerAuth API Server running on port ${PORT}`);
            console.log(` Health check: http://localhost:${PORT}/api/health`);
        });
        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                await prisma_js_1.default.$disconnect();
                console.log('Database disconnected. Process exiting.');
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (error) {
        console.error('❌ Failed to start TerAuth server:', error);
        process.exit(1);
    }
}
// When deployed on Vercel serverless, Vercel invokes the exported app directly.
// In all other environments (local dev, Docker container, standalone VM), run bootstrap listener.
if (!process.env.VERCEL) {
    void bootstrap();
}
