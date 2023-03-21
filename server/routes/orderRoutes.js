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

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      console.log("fodasse!!!");
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "email name"
    );
    console.log(order);
    if (order) {
      console.log(order);
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      try {
        alert("aqui");
        mailgun()
          .messages()
          .send(
            {
              from: "Store <carlosserodio1986@gmail.com>",
              to: `${order.user.name} <${order.user.email}>`,
              subject: `New order ${order._id}`,
              html: payOrderEmailTemplate(order),
            },
            (error, body) => {
              if (error) {
                console.log(error);
              } else {
                console.log(body);
              }
            }
          );
      } catch (err) {
        console.log(err);
      }

      res.send({ message: "Order Paid", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

// export
export default orderRouter;
