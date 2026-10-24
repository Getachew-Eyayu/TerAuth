// Serverless function entry point for Vercel
let app;
let initError = null;

function getApp() {
  if (app) return app;
  if (initError) throw initError;
  try {
    const expressApp = require('../backend/dist/app.js');
    app = expressApp.default || expressApp;
    return app;
  } catch (err) {
    initError = err;
    throw err;
  }
}

module.exports = (req, res) => {
  try {
    const handler = getApp();

    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/static')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    return handler(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          success: false,
          error: 'LAMBDA_INITIALIZATION_ERROR',
          message: error?.message,
          ...(process.env.NODE_ENV !== 'production' ? { stack: error?.stack } : {}),
        },
        null,
        2
      )
    );
  }
};
