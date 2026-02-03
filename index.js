const http = require("http");
const fs = require("fs");
const path = require("path");
const { loginPage, dashboardPage } = require("./controllers/login");

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Parse JSON body
  if (req.method === "POST" || req.method === "GET") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (req.headers["content-type"] === "application/json" && body) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Route handling
      if (req.method === "POST" && req.url === "/login") {
        loginPage(req, res);
      } else if (req.method === "GET" && req.url === "/dashboard") {
        dashboardPage(req, res);
      } else if (req.method === "GET") {
        // Serve static files
        let filePath = req.url === "/" ? "/index.html" : req.url;
        filePath = path.join(__dirname, "public", filePath);

        const extname = path.extname(filePath);
        const contentType =
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpg",
            ".gif": "image/gif",
          }[extname] || "text/plain";

        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === "ENOENT") {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end("404 Not Found");
            } else {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("500 Server Error");
            }
          } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
