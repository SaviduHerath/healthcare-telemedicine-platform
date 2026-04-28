const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    "^/api/doctors": "",
  },
});