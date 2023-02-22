// import
import express from "express";
import Product from "../models/productModel.js";
import expressAsyncHandler from "express-async-handler";

const productRouter = express.Router();

// get top products
productRouter.get(
  "/top-products",
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find()
      .populate("seller", "seller.name seller.logo")
      .sort({
        rating: -1,
      })
      .limit(5);

    // response
    res.send(products);
  })
);

export default productRouter;
