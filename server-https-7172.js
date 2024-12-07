/*
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout localhost7172.key -out localhost7172.crt \
-subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost7172"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout localhost5200proxyserver.key -out localhost5200proxyserver.crt \
-subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost5200"

 */

const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");

const app = express();

// Load your self-signed certificate
const certPath = path.resolve(__dirname, "localhost7172.crt");
const keyPath = path.resolve(__dirname, "localhost7172.key");

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.get("/", (req, res) => {
  res.send("Hello from root");
});

// Handle incoming requests
app.all("*", (req, res) => {
  // Collect headers
  const headers = req.headers;

  // Respond with the headers in JSON format
  res.json({
    message: "Headers received",
    headers,
  });
});

// Start the HTTPS server
https.createServer(options, app).listen(7172, () => {
  console.log("Server is running at https://localhost:7172");
});
