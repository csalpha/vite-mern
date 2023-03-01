// import
import express from "express";
import Product from "../models/productModel.js";
import expressAsyncHandler from "express-async-handler";

const productRouter = express.Router();

// this code is defining a route handler for a GET request to the "top-products" endpoint
productRouter.get(
  "/top-products",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // query the database for all products
    const products = await Product.find()
      // populates the "seller" field with the seller's name and logo
      .populate("seller", "seller.name seller.logo")
      //sorts the products in descending order based on their "rating" field
      .sort({
        rating: -1,
      })
      //limits the results to the top 5 products
      .limit(5);

    // response
    res.send(products);
  })
);

productRouter.get(
  "/slug/:slug",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async ({ params }, res) => {
    // query the database to find a product with the matching slug value
    const product = await Product.findOne({ slug: params.slug }).populate(
      "seller",
      "seller.name seller.logo seller.rating seller.numReviews"
    );

    //If the product is defined
    if (product) {
      // sends the product object in the response
      res.send(product);
    } else {
      //  sends a 404 error response with a message indicating that the product was not found.
      res.status(404).send({
        message: "Product Not Found",
      });
    }
  })
);

/* Route handler to get full details of all the products 
   sold by a specific seller */
productRouter.get(
  "/sellers/:id",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async ({ params }, res) => {
    // Finding a product associated with a certain seller using the provided id
    const products = await Product.find({
      seller: params.id,
    }).populate(
      "seller", // Populating the seller information
      "seller.name seller.logo seller.rating seller.numReviews"
    );
    // Sending the found products as the response
    res.send(products);
  })
);

// Send an HTTP GET request for product with specific ID
productRouter.get(
  "/:id",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // Retrieve product from the database using req parameter
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "seller.name seller.logo seller.rating seller.numReviews"
    );
    // If a product is retrieved, send it in response
    if (product) {
      res.send(product);
    } // Otherwise, when product is not found, send 404 error
    else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

export default productRouter;
