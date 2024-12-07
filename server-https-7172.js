const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

// Load your self-signed certificate
const certPath = path.resolve(__dirname, "localhost7172.crt");
const keyPath = path.resolve(__dirname, "localhost7172.key");

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.use(cookieParser());

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
      <h1>Sample Fetch UI</h1>
      <p>${loginStatus}</p>
      <button id="login">Login</button>
      <button id="logout">Logout</button>
      <p id="jokes"></p>
      <script>
        document.getElementById("login").addEventListener("click", async () => {
          await fetch("/login", { method: "POST" });
          //alert("Logged in as Elliot!");
          location.reload();
        });

        document.getElementById("logout").addEventListener("click", async () => {
          await fetch("/logout", { method: "POST" });
          //alert("Logged out!");
          location.reload();
        });

        (async () => {
          const res = await fetch("/jokes");
          const text = await res.text();
          document.getElementById("jokes").innerHTML = text;
        })();
      </script>
      <hr />
      ${headerRendering}
    </body>
    </html>
  `);
});

// Login endpoint
app.post("/login", (req, res) => {
  res.cookie("username", "Elliot", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).send("Logged in as Elliot");
});

// Logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.status(200).send("Logged out");
});

// Jokes endpoint
app.get("/jokes", (req, res) => {
  const username = req.cookies.username;
  if (username) {
    const jokes = `
      <ul>
        <li>Why don’t skeletons fight each other? They don’t have the guts.</li>
        <li>Why did the scarecrow win an award? Because he was outstanding in his field.</li>
        <li>What do you call fake spaghetti? An impasta.</li>
      </ul>
    `;
    res.send(jokes);
  } else {
    res.send("No Jokes to display. Very sorry.");
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
      <title>Headers for ${req.path}</title>
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
    "Server is running at https://localhost:7172 (server-https-7172.js)! 🚀",
  );
});
