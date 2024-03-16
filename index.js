const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const db = require("./connect");

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(express.json());
// app.use(require("./routes/recommend"))
app.use(require("./routes/login"));
app.use(require("./routes/products"));

app.use(express.static(path.join(__dirname, "./shop/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./shop/build/index.html"), function (err) {
    res.status(500).send(err);
  });
});

app.listen(port, () => {
  console.log("Server is running on " + port);
});
