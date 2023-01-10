import express from "express";
import data from "./data.js";
import productRouter from "./routes/productRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// {} []
const port = 5000;

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// open mongoose connection to MongoDb
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/ecommerce" // path
);

app.use(
  "api/products", // path
  productRouter // callbackck
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/products", (req, res) => {
  res.send(data.products);
});

// // app.get("/api/users", (req, res) => {
// //   res.send(data.users);
// // });

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
