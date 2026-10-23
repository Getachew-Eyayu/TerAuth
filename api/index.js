// Serverless function entry point for Vercel
const expressApp = require('../backend/dist/app.js');
const app = expressApp.default || expressApp;

module.exports = (req, res) => {
  // Normalize URL prefix so /api routes match whether Vercel strips /api or keeps it
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/static')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
