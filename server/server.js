import express from "express";
// // import data from "./data.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import uploadRouter from "./routes/uploadRoutes.js";

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

app.use("/api/upload", uploadRouter);

// Registers the productRouter under "/api/products".
app.use("/api/products", productRouter);

// Registers the userRouter under "/api/users".
app.use("/api/users", userRouter);

// Registers the orderRouter under "/api/orders".
app.use("/api/orders", orderRouter);

app.get(
  "/api/keys/paypal", // route
  (req, res) => {
    res.send(
      process.env.PAYPAL_CLIENT_ID || // sends back the PayPal client ID  OR
        "sb" // a default string
    );
  }
);

// define __dirname (absolute path)
// resolve a sequence of path-segments to an absolute path
const __dirname = path.resolve();

app.use(
  "/uploads", // path
  // creates an express app that serves static files
  express.static(
    // join all arguments together and normalize the resulting path
    path.join(
      __dirname, // absolute path
      "/upload" // path
    )
  ) // callback
);

/* Starts the server listening on the specified port 
and logs a message indicating the server is running. */
app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
