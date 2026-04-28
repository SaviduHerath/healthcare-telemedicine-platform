const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE || "http://localhost:5003",
  changeOrigin: true,
});