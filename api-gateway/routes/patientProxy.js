const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = createProxyMiddleware({
  target: process.env.PATIENT_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "",
  },
});