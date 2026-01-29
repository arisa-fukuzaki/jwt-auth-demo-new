const express = require("express");
const router = require("./routes/login");
const app = express();

app.use(express.static("./public"));
// middleware to get username & password input by users from req.body
app.use(express.json());
// router uses a middleware above -> router comes after it
app.use(router);
const port = process.env.PORT || 3000;

app.listen(port);
