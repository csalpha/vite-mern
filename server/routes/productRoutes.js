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

//this route handler is used to retrieve a single product from the database using the product's unique slug identifier.

// this code is defining a route handler for a GET request to the "/slug/:slug" endpoint
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

// this code is defining a route for Get request to the "/sellers/:id" endpoint
productRouter.get(
  "/sellers/:id",
  // callback function to handle the request  and send a response.
  expressAsyncHandler(async ({ params }, res) => {
    // query the database ( request )
    const products = await Product.find({
      seller: params.id,
    }).populate(
      "seller",
      "seller.name seller.logo seller.rating seller.numReviews"
    );

    // response
    res.send(products);
  })
);

export default productRouter;
// // {} []
