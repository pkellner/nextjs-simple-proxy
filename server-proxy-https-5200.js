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

//const target = "https://proxytest.73rdst.com"; // Target server
const target = "https://localhost:7172"; // Target server

app.use((req, res, next) => {
  // console.log("Incoming request:", {
  //   method: req.method,
  //   url: req.url,
  //   headers: req.headers
  // });
  next();
});

// Proxy middleware
app.use(
  "*",
  createProxyMiddleware({
    target: target, // Proxy to target server
    //changeOrigin: true, // Updates the host header to the target URL
    secure: false, // Allow self-signed SSL certificates
    pathRewrite: (path, req) => {
      return req.originalUrl;
    },
    onProxyReq: (proxyReq, req, res) => {

      console.log("Original request Origin:", req.headers.origin);
      console.log("Setting Origin to:", "https://localhost:7172");
      proxyReq.setHeader("Origin", "https://localhost:7172");


      // Forward client cookies to the target server
      if (req.headers.cookie) {
        console.log("Forwarding Cookies:", req.headers.cookie);
      }

      // Set a custom header
      proxyReq.setHeader("X-Custom-Header", "my-custom-value");

      console.log("Proxy Request Headers:", proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Response from target server:", proxyRes.statusCode);

      // Remove any existing CORS headers from the target response
      delete proxyRes.headers["access-control-allow-origin"];
      delete proxyRes.headers["access-control-allow-methods"];
      delete proxyRes.headers["access-control-allow-headers"];
      delete proxyRes.headers["access-control-allow-credentials"];

      // Forward set-cookie headers if present
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("Set-Cookie", proxyRes.headers["set-cookie"]);
      }

      // Set specific CORS headers for the client
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    },
    logLevel: "debug", // Debugging proxy activity
  })
);

// Start the HTTPS server on port 5200
https.createServer(options, app).listen(5200, () => {
  console.log(`Proxy server is running at https://localhost:5200 and proxy to ${target}`);
});
