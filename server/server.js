import express from "express";
import data from "./data.js";

// const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/products", (req, res) => {
  res.send(data.products);
});

app.get("/api/users", (req, res) => {
  res.send(data.users);
});

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
