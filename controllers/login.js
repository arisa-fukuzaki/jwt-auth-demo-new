const jwt = require("jsonwebtoken");
require("dotenv").config();

// callback functions
const loginPage = (req, res) => {
  const { username, password } = req.body;

  // check if username & password are not empty
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Username and password are required" }));
    return;
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ msg: "Login successful", token }));
};

const dashboardPage = (req, res) => {
  const authenticator = req.headers.authorization;

  // authentication: Bearer <token>
  if (!authenticator || !authenticator.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: "Unauthorized: No token provided" }));
    return;
  }

  const token = authenticator.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: `Welcome to the dashboard, ${decoded.username}` }));
  } catch (error) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ msg: "Unauthorized: Invalid token" }));
  }
};

module.exports = { loginPage, dashboardPage };
