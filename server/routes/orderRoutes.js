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

/* This code defines a GET request route for fetching the details 
   of a specific order, identified by its id parameter in the URL.  */

// creates an HTTP GET request handler for the "/id" endpoint.
orderRouter.get(
  "/:id", // route parameter represents the id of the order to be fetched
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  // route handler function that fetches the order details and sends it back in the response
  // route handler function that updates the payment details of an order and sends an email to the user
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); // finds the order by its id
    if (order) {
      // send order
      res.send(order);
    } else {
      // send error message
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

/* This code defines a route handler function for updating 
   the payment details of an order with the given id.      */

// creates an  PUT request handler for the "/id/pay" endpoint.
orderRouter.put(
  "/:id/pay", // route parameter represents the id of the order to be updated with payment details
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  // route handler function that updates the payment details of an order and sends an email to the user
  expressAsyncHandler(async (req, res) => {
    // finds the order by its id, and then populates the 'user' field with email and name fields
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
        id: req.body.id, // id of the payment transaction
        status: req.body.status, // status of the payment transaction
        update_time: req.body.update_time, // timestamp of when the payment was updated
        email_address: req.body.email_address, // email address associated with the payment
      };

      // saves the updated order details
      const updatedOrder = await order.save();
      try {
        alert("aqui");
        mailgun() // sends an email using mailgun service
          .messages()
          .send(
            {
              from: "Store <carlosserodio1986@gmail.com>",
              to: `${order.user.name} <${order.user.email}>`, // email address of the recipient
              subject: `New order ${order._id}`, // email subject
              html: payOrderEmailTemplate(order), // HTML content of the email body containing the order details
            },
            // callback function that handles the response from the mailgun API
            (error, body) => {
              if (error) {
                console.log(error); // logs error message to the console
              } else {
                console.log(body); // logs mailgun API response body to the console
              }
            }
          );
      } catch (err) {
        console.log(err); // logs error message to the console if any exception occurs in try block
      }
      // sends a success message and updated order details in the response
      res.send({ message: "Order Paid", order: updatedOrder });
    } else {
      // sends an error message in the response if no order is found with the given id
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

/* This code creates a PUT request handler for the /id/deliver endpoint  */

// creates an  PUT request handler for the "/id/deliver" endpoint.
orderRouter.put(
  "/:id/deliver", // route parameter represents the id of the order to be marked as delivered
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  isAdmin, // middleware function that checks if the user trying to access the route has admin privileges
  // route handler function that marks an order as delivered
  expressAsyncHandler(async (req, res) => {
    // finds the order by its id
    const order = await Order.findById(req.params.id);
    console.log(order);
    if (order) {
      order.isDelivered = true; // sets the 'isDelivered' flag to true indicating the order has been delivered
      order.deliveredAt = Date.now(); // sets the 'deliveredAt' field to the current timestamp

      const updatedOrder = await order.save(); // saves the updated order details
      res.send({ message: "Order Delivered", order: updatedOrder }); // sends a success message and updated order details in the response
    } else {
      // sends an error message in the response if no order is found with the given id
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

// export
export default orderRouter;
