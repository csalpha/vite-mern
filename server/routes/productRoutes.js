// import
import express from "express";
import Product from "../models/productModel.js";
import expressAsyncHandler from "express-async-handler";

const productRouter = express.Router();

// get top products
productRouter.get(
  "/top-products", // 1st parameter - api address
  expressAsyncHandler(
    async (
      req, // 1st param - request
      res // 2nd param - response
    ) => {
      // get products using Product.find()
      const products = await Product.find()
        .populate(
          "seller", // 1st param
          "seller.name seller.logo" // 2nd param
        )
        // // .sort({
        // //   rating: -1, // pass rating
        // // })
        .limit(
          4 // pass 4
        );

      // response
      res.send(
        products // pass products
      );
    } // pass async function
  ) // 2nd parameter - expressAsyncHandler
);

// export
export default productRouter;
