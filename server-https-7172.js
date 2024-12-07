const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Load your self-signed certificate
const certPath = path.resolve(__dirname, "localhost7172.crt");
const keyPath = path.resolve(__dirname, "localhost7172.key");

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.use(cookieParser());

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none", // when set to "none" the react app works, strict does not
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:5200",
  "https://localhost:5200",
  "http://localhost:7172",
  "https://localhost:7172",
  "http://localhost:3000",
  "https://localhost:3000",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, etc.)
  }),
);

function renderHeaders(req) {
  const headers = req.headers;

  const cookies = headers["cookie"]
    ? [{ key: "Cookie", value: headers["cookie"] }]
    : [];
  const securityHeaders = Object.entries(headers).filter(([key]) =>
    [
      "x-frame-options",
      "x-content-type-options",
      "strict-transport-security",
      "content-security-policy",
      "referrer-policy",
      "permissions-policy",
    ].includes(key.toLowerCase()),
  );
  const normalHeaders = Object.entries(headers).filter(
    ([key]) =>
      key.toLowerCase() !== "cookie" &&
      !securityHeaders.some(([secKey]) => secKey === key),
  );

  const formatHeaders = (headersList) =>
    headersList
      .map(
        ([key, value]) =>
          `<tr><td style="padding: 8px; border: 1px solid #ddd;">${key}</td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`,
      )
      .join("");

  const cookieSection = cookies.length
    ? `
      <h2>Cookies</h2>
      <table>
        <thead>
          <tr><th>Header</th><th>Value</th></tr>
        </thead>
        <tbody>
          ${cookies
            .map(({ key, value }) => formatHeaders([[key, value]]))
            .join("")}
        </tbody>
      </table>
    `
    : "";

  const securitySection = `
    <h2>Security Headers</h2>
    <table>
      <thead>
        <tr><th>Header</th><th>Value</th></tr>
      </thead>
      <tbody>
        ${formatHeaders(securityHeaders)}
      </tbody>
    </table>
  `;

  const normalSection = `
    <h2>Other Headers</h2>
    <table>
      <thead>
        <tr><th>Header</th><th>Value</th></tr>
      </thead>
      <tbody>
        ${formatHeaders(normalHeaders)}
      </tbody>
    </table>
  `;

  return `
    <div>
      <h1>Headers Received for server-http-7172</h1>
      <h2>(could be behind reverse proxy)</h2>
      ${cookieSection}
      ${cookies.length ? "<hr />" : ""}
      ${securitySection}
      <hr />
      ${normalSection}
    </div>
  `;
}

// Root page with Login and Logout buttons
app.get("/", (req, res) => {
  const username = req.cookies.username;
  const loginStatus = username
    ? `${username} is logged in.`
    : "No one is logged in.";
  const headerRendering = renderHeaders(req);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sample Fetch UI (HTTPS with strict and secure)</title>
    </head>
    <body>
      <h3> /login and /logout to set and clear cookie ${JSON.stringify(cookieOptions)}</h3>
      ${headerRendering}
    </body>
    </html>
  `);
});

app.get("/login", (req, res) => {
  res.cookie("username", "Elliot1", cookieOptions);
  // redirect to root
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

// Jokes endpoint
app.get("/jokes", (req, res) => {
  const username = req.cookies.username;
  if (username) {
    res.json([
      "Why don’t skeletons fight each other? They don’t have the guts.",
      "Why did the scarecrow win an award? Because he was outstanding in his field.",
      "What do you call fake spaghetti? An impasta.",
    ]);
  } else {
    res.status(401).send("401 Unauthorized: Please log in to view jokes.");
  }
});

// All other routes
app.all("*", (req, res) => {
  const headerRendering = renderHeaders(req);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Headers for ${req.path} </title>
    </head>
    <body>
      ${headerRendering}    
    </body>
    </html>
  `);
});

// Start the HTTPS server
https.createServer(options, app).listen(7172, () => {
  console.log(
    "Server is running at https://localhost:7172 (server-https-7172.js)! 🚀🚀",
    cookieOptions,
  );
});
