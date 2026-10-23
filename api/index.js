// Serverless function entry point for Vercel
const path = require('path');

let expressApp;
try {
  expressApp = require('../backend/dist/app.js');
} catch (e1) {
  try {
    expressApp = require('./backend/dist/app.js');
  } catch (e2) {
    try {
      expressApp = require(path.join(process.cwd(), 'backend', 'dist', 'app.js'));
    } catch (e3) {
      // Return clear error if backend bundle is somehow not found
      module.exports = (req, res) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'BACKEND_NOT_FOUND',
          cwd: process.cwd(),
          attempt1: e1.message,
          attempt2: e2.message,
          attempt3: e3.message,
        }, null, 2));
      };
      return;
    }
  }
}

const app = expressApp.default || expressApp;

module.exports = (req, res) => {
  // Normalize URL prefix so /api routes match whether Vercel strips /api or keeps it
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/static')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
