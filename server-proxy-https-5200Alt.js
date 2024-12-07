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

// Global handler for modifying the Origin header
proxy.on("proxyReq", (proxyReq, req) => {
  console.log("Original Origin:", req.headers.origin);
  proxyReq.setHeader("Origin", "http://peterkellner.net"); // Set new origin
  console.log("Modified Origin: http://peterkellner.net");
});

// Log the response status from the target server
proxy.on("proxyRes", (proxyRes) => {
  console.log("Response from target server:", proxyRes.statusCode);
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
