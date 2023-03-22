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

// this code is defining a route handler for a GET request to the "/sellers/:id" endpoint
// get full details of all the products sold by a specific seller
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

// this code is defining a route handler for a GET request to the "/:id" endpoint
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

// this code is defining a route handler for a GET request to the "/categories" endpoint
// Get all categories of products
productRouter.get(
  "/categories",
  // callback function to handle the request and send a response.
  expressAsyncHandler(async (req, res) => {
    // Find distinct categories from Product collection
    const categories = await Product.find().distinct("category");
    // Send the categories back to the client
    res.send(categories);
  })
);

// this code is defining a route handler for a GET request to the "/" endpoint
const PAGE_SIZE = 3;
productRouter.get(
  "/", // API endpoint
  // callback function to handle the request and send a response.
  expressAsyncHandler(async ({ query }, res) => {
    // set page size to query page size or default page size
    const pageSize = query.pageSize || PAGE_SIZE;
    // set page to query page or default page
    const page = query.page || 1;
    // set category to query category or empty string
    const category = query.category || "";
    // set brand to query brand or empty string
    const brand = query.brand || "";
    // set price to query price or empty string
    const price = query.price || "";
    // set rating to query rating or empty string
    const rating = query.rating || "";
    // set order to query order or empty string
    const order = query.order || "";
    // set searchQuery to query query or empty string
    const searchQuery = query.query || "";

    /* if searchQuery is not empty and not equal to all
       set queryFilter to regex of searchQuery */
    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
            name: {
              $regex: searchQuery,
              $options: "i",
            },
          }
        : // else set to empty object
          {};
    /* if category is not empty and not equal to all 
       set categoryFilter to category */
    const categoryFilter =
      category && category !== "all"
        ? { category }
        : // else set to empty object
          {};
    /*  if brand is not empty and not equal to all
    // set brandFilter to brand */
    const brandFilter =
      brand && brand !== "all"
        ? { brand }
        : // else set to empty object
          {};
    /* if rating is not empty and not equal to all
       set ratingFilter to rating */
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : // else set to empty object
          {};

    /* if price is not empty and not equal to all
       set priceFilter to price  */
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : // else set to empty object
          {};

    /* set sortOrder to featured, lowest, highest,
     toprated, newest, or _id based on query order */
    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "newest"
        ? { createdAt: -1 }
        : { _id: -1 };

    // Find products from Product collection
    /* filter products by   queryFilter, categoryFilter, 
       priceFilter, brandFilter, and ratingFilter        */
    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    })
      // populate seller with name and logo
      .populate("seller", "seller.name seller.logo")
      // sort the results according to sortOrder
      .sort(sortOrder)
      // skip pageSize * (page - 1) results
      .skip(pageSize * (page - 1))
      // limit the results to pageSize
      .limit(pageSize);

    /* Count the number of documents in the Product collection that match the given 
       queryFilter, categoryFilter, priceFilter, brandFilter and ratingFilter  */
    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    });

    /* Send a response object containing 
    the products, countProducts, page and pages */
    res.send({
      products, // Array of products
      countProducts, // Total number of products
      page, // Current page number
      pages: Math.ceil(countProducts / pageSize), // Total number of pages
    });
  })
);

export default productRouter;
