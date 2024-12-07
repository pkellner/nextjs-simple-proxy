const fs = require("fs");
const https = require("https");
const express = require("express");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Load your self-signed certificate
const options = {
  key: fs.readFileSync("localhost5200proxyserver.key"),
  cert: fs.readFileSync("localhost5200proxyserver.crt"),
};

const app = express();

// Parse cookies to ensure they're available in `req.cookies`
app.use(cookieParser());

// Proxy middleware
app.use(
  "*",
  createProxyMiddleware({
    target: "https://localhost:7172", // Proxy to target server
    changeOrigin: true, // Updates the host header to the target URL
    secure: false, // Allow self-signed SSL certificates
    pathRewrite: (path, req) => {
      // Forward the original path to the target server
      console.log("Original Path:", req.originalUrl);
      return req.originalUrl;
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward client cookies to the target server
      if (req.headers.cookie) {
        console.log("Forwarding Cookies:", req.headers.cookie);
        //proxyReq.setHeader("Cookie", req.headers.cookie);
      }

      // Set a custom header
      proxyReq.setHeader("X-Custom-Header", "my-custom-value");
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove any existing CORS headers from the target response
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];
      delete proxyRes.headers["access-control-allow-credentials"];

      // Forward set-cookie headers if present
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("Set-Cookie", proxyRes.headers["set-cookie"]);
      }

      // Set CORS headers for the client
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    },
    logLevel: "debug", // Debugging proxy activity
  })
);

// Start the HTTPS server on port 5200
https.createServer(options, app).listen(5200, () => {
  console.log("Proxy server is running at https://localhost:5200");
});