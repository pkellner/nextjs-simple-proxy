const fs = require("fs");
const https = require("https");
const express = require("express");
const httpProxy = require("http-proxy");

// Load your self-signed certificate
const options = {
  key: fs.readFileSync("localhost5200proxyserver.key"),
  cert: fs.readFileSync("localhost5200proxyserver.crt"),
};

const app = express();

// Target server
const target = "https://localhost:7172";

const proxy = httpProxy.createProxyServer({
  target,
  changeOrigin: true,
  secure: false, // Allow self-signed SSL certificates
  agent: new https.Agent({ rejectUnauthorized: false }),
});

proxy.on("proxyReq", (proxyReq, req) => {
  if (req.headers.cookie) {
    proxyReq.setHeader("Cookie", req.headers.cookie); // Forward client cookies
    console.log("Forwarding Cookie to Target:", req.headers.cookie);
  }
});

// Add more event listeners
proxy.on('proxyReq', (proxyReq, req, res) => {
  console.log("Proxy Request Details:");
  console.log("Target:", target);
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.url);
});

// Global handler for modifying the Origin header
proxy.on("proxyReq", (proxyReq, req) => {
  console.log("Original Origin:", req.headers.origin);
  proxyReq.setHeader("Origin", "http://localhost:3000"); // Set new origin
  console.log("Modified Origin: http://localhost:3000");

  // Forward cookies from the client
  if (req.headers.cookie) {
    console.log("Forwarding Cookies:", req.headers.cookie);
    proxyReq.setHeader("Cookie", req.headers.cookie);
  }
});

// Log the response status from the target server
proxy.on("proxyRes", (proxyRes, req, res) => {
  console.log("Response from target server:", proxyRes.statusCode);
  console.log("Full response headers:", proxyRes.headers);

  // Pass `Set-Cookie` headers back to the client
  if (proxyRes.headers['set-cookie']) {
    console.log("Set-Cookie from target:", proxyRes.headers['set-cookie']);
    res.setHeader("Set-Cookie", proxyRes.headers['set-cookie']);
  }
});

// Middleware to handle all requests
app.use("*", (req, res) => {
  console.log("Forwarding request to target server:", req.method, req.originalUrl);

  proxy.web(req, res, {}, (err) => {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy encountered an error.");
  });
});

// Start the HTTPS server on port 5200
https.createServer(options, app).listen(5200, () => {
  console.log(`Proxy server is running at https://localhost:5200 and proxying to ${target}`);
});
