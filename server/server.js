import express from "express";
// // import data from "./data.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// {} []
const port = 5000;

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

mongoose.set("strictQuery", true);

// open mongoose connection to MongoDb
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/ecommerce")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

app.use("/api/products", productRouter);

app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
