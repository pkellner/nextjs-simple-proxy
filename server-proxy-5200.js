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
    target: "https://localhost:7172",
    changeOrigin: true, // Updates the host header to the target URL
    secure: false, // Allow self-signed SSL certificates
    onProxyReq: (proxyReq, req, res) => {
      // Pass cookies from the client to the backend
      if (req.headers.cookie) {
        proxyReq.setHeader("Cookie", req.headers.cookie);
      }

      // Optionally set additional custom headers
      proxyReq.setHeader("X-Custom-Header", "my-custom-value");
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ensure the response includes cookies
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("Set-Cookie", proxyRes.headers["set-cookie"]);
      }

      // Set CORS headers for browser compatibility
      res.setHeader("Access-Control-Allow-Origin", "*"); // Replace '*' with specific origin if needed
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization",
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
    },
    logLevel: "debug", // Debugging proxy activity
  }),
);

// Start the HTTPS server on port 5200
https.createServer(options, app).listen(5200, () => {
  console.log("Proxy server is running at https://localhost:5200");
});
