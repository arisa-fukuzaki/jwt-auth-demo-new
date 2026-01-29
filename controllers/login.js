const jwt = require("jsonwebtoken");
require("dotenv").config();

// callback functions
const loginPage = (req, res) => {
  const { username, password } = req.body;

  // check if username & password are not empty
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.status(200).json({ msg: "Login successful", token });
};

const dashboardPage = (req, res) => {
  const authenticator = req.headers.authorization;

  // authentication: Bearer <token>
  if (!authenticator || !authenticator.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authenticator.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res
      .status(200)
      .json({ msg: `Welcome to the dashboard, ${decoded.username}` });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { loginPage, dashboardPage };
