// Serverless function entry point for Vercel with resilient diagnostic error capturing
let app;
let initError = null;

try {
  const expressApp = require('../backend/dist/app.js');
  app = expressApp.default || expressApp;
} catch (err) {
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    let dirTree = [];
    try {
      const fs = require('fs');
      dirTree = fs.readdirSync(process.cwd());
    } catch (_) {}

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        status: 'error',
        source: 'api/index.js initialization',
        message: initError.message,
        stack: initError.stack,
        cwd: process.cwd(),
        dirTree,
      }, null, 2)
    );
  }

  // Normalize URL prefix so /api routes match whether Vercel strips /api or keeps it
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/static')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
