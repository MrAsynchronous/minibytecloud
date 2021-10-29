const express = require("express");
const app = express();

const PORT = 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, function () {
  console.log(`Running on http://${HOST}:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Users Shown");
});

app.get("/devops", (req, res) => {
  res.send("Hello World!");
});
