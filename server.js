const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: "https://www.mysecureserver.com", // Target server to proxy to
    changeOrigin: true, // Changes the Host header to match the target
    secure: true, // Verifies SSL certificates of the target server
    onProxyReq: (proxyReq, req, res) => {
      // Set a fake Origin header
      proxyReq.setHeader("Origin", "https://www.fake-origin.com");
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Proxied request to: ${req.method} ${req.url}`);
    },
  }),
);

const PORT = 5200;
app.listen(PORT, () => {
  console.log(`Reverse proxy running at http://localhost:${PORT}`);
});
