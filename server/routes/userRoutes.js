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

// This code defines a GET request route for retrieving user details by ID
userRouter.get(
  "/:id", // The endpoint is set as "/:id" which captures the user id from the url
  isAuth, // Middleware function to ensure the user is authenticated
  isAdmin, // Middleware function to ensure the user has admin privileges
  // Async handler function that processes the request and sends the response
  expressAsyncHandler(async (req, res) => {
    //Retrieve the user details by ID from the database
    const user = await User.findById(req.params.id);
    // if the user with the specified ID is found
    if (user) {
      // Returns a successful response with the user details
      res.send(user);
    }
    // if the user with the specified ID is not found
    else {
      // Returns an error message
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

// update the user profile
userRouter.put(
  "/profile",
  isAuth, // Middleware function to ensure the user is authenticated
  // Async handler function that processes the request and sends the response
  expressAsyncHandler(async (req, res) => {
    // Find the user by their id
    const user = await User.findById(req.user._id);
    if (user) {
      // Update the user's name and email
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // If the user is a seller
      if (user.isSeller) {
        //update seller information
        user.seller.name = req.body.sellerName || user.seller.name;
        user.seller.logo = req.body.sellerLogo || user.seller.logo;
        user.seller.description =
          req.body.sellerDescription || user.seller.description;
      }
      // If the user has provided a new password, hash it
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      // Save the updated user
      const updatedUser = await user.save();
      // Send the updated user information back to the client
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(updatedUser),
      });
    }
  })
);

// defining a route for the GET request on the specified URL ("/") enpoint
userRouter.get(
  "/", // enpoint
  isAuth, // Middleware function to ensure the user is authenticated
  isAdmin, // Middleware function to ensure the user has admin privileges
  // Async handler function that processes the request and sends the response
  expressAsyncHandler(async (req, res) => {
    // find all users in the database
    const users = await User.find({});
    // send a response to the client with the users data
    res.send(users);
  })
);

// defining a route for the delete request method on the root URL ("/:id") enpoint
userRouter.delete(
  "/:id", // the route handler function expects an ID parameter in the URL path
  isAuth, // Middleware function to ensure the user is authenticated
  isAdmin, // Middleware function to ensure the user has admin privileges
  // Async handler function that processes the request and sends the response
  expressAsyncHandler(async (req, res) => {
    // Find the user by their id
    const user = await User.findById(req.params.id);

    // If the user is found
    if (user) {
      // the function checks whether the user is the admin user.
      if (user.email === "carlos@mail.com") {
        // sends a 400 error response and message.
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }

      // If the user is not the admin user
      // it calls the Mongoose remove method to delete the user from the database.
      const deleteUser = await user.remove();

      // If the deletion is successful,
      // it sends  a response to the client
      // with a success message and the deleted user object
      res.send({ message: "User Deleted", user: deleteUser });
    } else {
      // If the user is not found,
      // it sends a 404 error response and message.
      res.status(404).send({ message: "User Not Found" });
    }
  })
);
// defining a route for the put request method on the root URL ("/:id") enpoint
userRouter.put(
  "/:id", //the route handler function expects an ID parameter in the URL path
  isAuth, // Middleware function to ensure the user is authenticated
  isAdmin, // Middleware function to ensure the user has admin privileges
  // Async handler function that processes the request and sends the response
  expressAsyncHandler(async (req, res) => {
    // Find the user by their id
    const user = await User.findById(req.params.id);

    // If the user is found
    if (user) {
      // the function updates the user's properties based on the request body
      // If a property is not provided in the request body,
      // it keeps the existing property value.
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isSeller = Boolean(req.body.isSeller);
      user.isAdmin = Boolean(req.body.isAdmin);
      // user.isAdmin = req.body.isAdmin || user.isAdmin;
      const updatedUser = await user.save();

      // If the update is successful,
      // it sends a success message and the updated user object in the response.
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      // If the user is not found,
      // it sends a 404 error response and message.
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

export default userRouter;
