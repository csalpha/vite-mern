import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";

const orderRouter = express.Router();

// creates an  get request handler for the "/" endpoint using the Express.js framework
orderRouter.get(
  "/",
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  isSellerOrAdmin, // A middleware function that checks if the user trying to access the route has seller/admin privileges.
  // route handler function that fetches data and sends it back in the response
  expressAsyncHandler(async (req, res) => {
    /* create a sellerFilter object, which will be used 
       to filter the orders returned by the query.      */
    const sellerFilter =
      // If the sellerMode query parameter is present in the request
      req.query.sellerMode
        ? // set the seller field of the filter to the current user's ID (req.user._id).
          { seller: req.user._id }
        : // otherwise, the sellerFilter object will be an empty object,
          // which will not filter the results.
          {};

    // Query the database for orders matching the seller filter, if provided.
    const orders = await Order.find({ ...sellerFilter }).populate(
      // Populate the "user" field with the user's name for each order.
      "user",
      "name"
    );
    // send the data back in the response
    res.send(orders);
  })
);

/* this code processes an HTTP POST request for creating a new order, 
making sure all required fields are given, and saving it on the database. */

/* This code defines a GET request route for fetching the details 
   of a specific order, identified by its id parameter in the URL.  */

/* This code defines a route handler function for updating 
   the payment details of an order with the given id.      */

// creates an  PUT request handler for the "/id/pay" endpoint using the Express.js framework
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

// creates an  PUT request handler for the "/id/deliver" endpoint using the Express.js framework
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

// Define a GET endpoint '/summary' using the Express.js framework
// It fetches and groups data from different MongoDB collections such as
// order, user, and product, and sends it back as a response in JSON format.
orderRouter.get(
  "/summary", // route path
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  isAdmin, // middleware function that checks if the user trying to access the route has admin privileges
  // Define an async handler function to fetch summary data from the database.
  expressAsyncHandler(async (req, res) => {
    // Use MongoDB's aggregate function to group the order collection into an array of documents with only the fields specified.
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Use MongoDB's aggregate function to group the user collection into an array of documents with only the fields specified.
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    // Use MongoDB's aggregate function to group the order collection into an array of documents with only the fields specified.
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          // use $dateToString operator to convert createdAt date to string in the format %Y-%m-%d
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
      // Sort the aggregated data by date.
      { $sort: { _id: 1 } },
    ]);

    // Use MongoDB's aggregate function to group the product collection into an array of documents with only the fields specified.
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // Send the fetched summary data back in JSON format as a response to the GET request.
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

// Route to get all orders for the logged in user
orderRouter.get(
  "/mine", // route path
  isAuth, // authentication middleware
  expressAsyncHandler(async (req, res) => {
    // find orders for the logged in user

    const orders = await Order.find({
      user: req.user._id,
    });
    // send the orders back to the client
    res.send(orders);
  })
);

// creates an HTTP POST request handler for the "/" endpoint using the Express.js framework
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
      console.log(order);
      const createdOrder = await order.save();

      res
        .status(201)
        .send({ message: "New Order Created", order: createdOrder });
    }
  })
);

// creates an HTTP GET request handler for the "/id" endpoint using the Express.js framework
orderRouter.get(
  "/:id", // route parameter represents the id of the order to be fetched
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  // route handler function that fetches the order details and sends it back in the response
  // route handler function that updates the payment details of an order and sends an email to the user
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id); // finds the order by its id
    console.log(order);
    if (order) {
      // send order
      res.send(order);
    } else {
      // send error message
      res.status(404).send({ message: "Order Not Found" });
    }
  })
);

// export
export default orderRouter;
