import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { isAdmin, isAuth } from "../utils.js";

const upload = multer();

const uploadRouter = express.Router();

uploadRouter.post(
  "/", // path
  isAuth, // middleware function that checks if the user trying to access the route is authenticated
  isAdmin, // middleware function that checks if the user trying to access the route has admin privileges

  // handle the file upload and store the uploaded file in memory
  upload.single("file"),
  async (req, res) => {
    // Set up the Cloudinary API configuration
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Define a function to upload the file using a stream
    const streamUpload = (req) => {
      // returns a Promise to upload the file to Cloudinary using a stream
      return new Promise((resolve, reject) => {
        // creates a Cloudinary uploader stream
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        // pipes the file buffer data to Cloudinary uploader stream using the streamifier library
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // Call the streamUpload function with the request object to upload the file
    const result = await streamUpload(req);

    // Send the uploaded file URL as a response
    res.send(result);
  }
);
export default uploadRouter;
