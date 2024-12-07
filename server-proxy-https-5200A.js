const fs = require("fs");
const https = require("https");
const express = require("express");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

const options = {
  key: fs.readFileSync("localhost5200proxyserver.key"),
  cert: fs.readFileSync("localhost5200proxyserver.crt"),
};

const app = express();
app.use(cookieParser());

//const target = "https://myrealdomain.com"; // Target server (does not work)
const target = "https://localhost:7172"; // Target server

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Allow self-signed certificates
});

app.use(
  "*",
  createProxyMiddleware({
    target: target,
    changeOrigin: true,
    secure: false, // Allow self-signed SSL certificates
    agent: httpsAgent,
    pathRewrite: (path, req) => {
      return req.originalUrl;
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader("Origin", "https://localhost:7172"); // this presents to remote server
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Response from target server:", proxyRes.statusCode);
      if (proxyRes.headers["set-cookie"]) {
        res.setHeader("Set-Cookie", proxyRes.headers["set-cookie"]);
      }
    },
    logLevel: "debug",
  })
);

https.createServer(options, app).listen(5200, () => {
  console.log(`Proxy server is running at https://localhost:5200 and proxy to ${target}`);
});
