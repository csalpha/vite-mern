import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";

const orderRouter = express.Router();

/* this code processes an HTTP POST request for creating a new order, 
making sure all required fields are given, and saving it on the database. */

// creates an HTTP POST request handler for the "/" endpoint.
orderRouter.post(
  "/",
  //  middleware function that checks if user has valid authentication credentials.
  isAuth,
  //wrapper function to handle any errors that might occur during the execution of the main function.
  expressAsyncHandler(async (req, res) => {
    // checks if there are any items in the cart
    if (req.body.orderItems.length === 0) {
      res.status(400).send({ message: "Cart is empty" });
    } else {
      // create a new order using the Order model
      const order = new Order({
        seller: req.body.orderItems[0].seller,
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      });

      // saves the order instance to the database
      const createdOrder = await order.save();

      res
        .status(201)
        .send({ message: "New Order Created", order: createdOrder });
    }
  })
);

// export
export default orderRouter;
