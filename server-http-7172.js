const http = require("http");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from the root of the app!");
});

// Handle most incoming requests except "/" above
app.all("*", (req, res) => {
  const headers = req.headers;

  // Identify header categories
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

  // Generate HTML sections
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

  // HTML template
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Headers Received for server-http-7172 (could be behind reverse proxy)</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
        }
        h1 {
          color: #333;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }
        th {
          background-color: #f4f4f4;
          text-align: left;
          padding: 8px;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        hr {
          border: none;
          border-top: 4px solid #333;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>eaders Received for server-http-7172</h1>
      <h2>(could be behind reverse proxy)</h2>
      ${cookieSection}
      ${cookies.length ? "<hr />" : ""}
      ${securitySection}
      <hr />
      ${normalSection}
    </body>
    </html>
  `;

  res.send(html);
});

// Start the HTTP server
http.createServer(app).listen(7172, () => {
  console.log(
    "Server is running at http://localhost:7172 (server-http-7172.js)! 🚀",
  );
});
