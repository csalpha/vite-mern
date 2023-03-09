import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken, isAdmin, isAuth } from "../utils.js";
// {}
const userRouter = express.Router();

// this code is defining a route handler for a GET request to the "top-sellers" endpoint
userRouter.get(
  "/top-sellers",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // query the database for the top three sellers by rating
    const topSellers = await User.find({ isSeller: true })
      //sorts the sellers in descending order based on their "rating" field
      .sort({ "seller.rating": -1 })
      .limit(3); //limits the results to the top 3 sellers
    // send a response
    res.send(topSellers);
  })
);

// this code is definning a route handler for a GET request to the "sellers/:id" endpoint
userRouter.get(
  "/sellers/:id",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // query the database
    const user = await User.findById(req.params.id);
    if (user && user.isSeller) {
      // send a response
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        seller: user.seller,
      });
    } else {
      res.status(404).send({ message: "Seller Not Found" });
    }
  })
);

// this code is definning a route handler for a POST request to the "/signin" endpoint
userRouter.post(
  "/signin",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // Find a user in the database using their email address
    const user = await User.findOne({ email: req.body.email });
    // If a matching user exists in the database
    if (user) {
      // Check if the password matches the stored hash
      if (bcrypt.compareSync(req.body.password, user.password)) {
        // If the password is correct, send a response containing the user's info and a JWT token
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSeller: user.isSeller,
          token: generateToken(user),
        });
        return;
      }
    }
    // If no user or incorrect password was found, send a '401 Unauthorized' error response
    res.status(401).send({ message: "Invalid email or password" });
  })
);

// this code is definning a route handler for a POST request to the "/signup" endpoint
userRouter.post(
  "/signup",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // creates a new user object using the User model provided.
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      // hashes a user's password before saving.
      password: bcrypt.hashSync(req.body.password, 8),
    });

    /*  saves the user object to the database and returns a promise
     that resolves once the operation is complete. */
    const createdUser = await user.save();

    // sends a JSON response back to the client with user details and an authentication token.
    res.send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      isSeller: user.isSeller,
      token: generateToken(createdUser),
    });
  })
);

export default userRouter;
