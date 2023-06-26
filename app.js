const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const functions = require("./functions.js");
const app = express();
const bodyParser = require("body-parser");
// const queries = require("./queries.js");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("dashboard");
});

app.post("/allInOne", functions.allInOne3);
app.post("/allInOne2", functions.allInOne32);

// Setting Content Headers
const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};

app.use(allowCrossDomain);

http.createServer(app).listen(3030);
console.log("server is running on port 3030 ...");
