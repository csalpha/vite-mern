import express from "express";
// // import data from "./data.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// {} []

// Defines the port that the server will listen on.
const port = 5000;

// Loads environment variables from a .env file into process.env.
dotenv.config();

// Creates a new Express application
const app = express();

// Adds middleware to parse JSON requests.
app.use(express.json());

// Adds middleware to parse form-urlencoded data.
app.use(express.urlencoded({ extended: true }));

// Sets strictQueries on Mongoose queries.
mongoose.set("strictQuery", true);
/* Connects to the MongoDB database specified in the .env file,
 or falls back to a local instance named ecommerce. */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/ecommerce")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

// Registers the productRouter under "/api/products".
app.use("/api/products", productRouter);

// Registers the userRouter under "/api/users".
app.use("/api/users", userRouter);

// Registers the orderRouter under "/api/orders".
app.use("/api/orders", orderRouter);

/* Starts the server listening on the specified port 
and logs a message indicating the server is running. */
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
