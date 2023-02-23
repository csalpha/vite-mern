import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
// {}
const userRouter = express.Router();

// this code is defining a route handler for a GET request to the "top-sellers" endpoint
userRouter.get(
  "/top-sellers",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // query the database for the top three sellers by rating
    const topSellers = await User.find({ isSeller: true })
      .sort({ "seller.rating": -1 })
      .limit(3);
    // send a response
    res.send(topSellers);
  })
);

export default userRouter;
