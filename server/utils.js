import jwt from "jsonwebtoken";

/* protect routes from unauthorized access by allowing only sellers and admins to access them. 
It checks for a valid authentication token and checks if it has the required signature to allow accessing such routes. */

//The generateToken function returns the resulting JWT string
export const generateToken = (user) => {
  /* token can be used for various authentication and authorization purposes, 
  such as verifying the user's identity or granting access to protected resources. */
  return jwt.sign(
    // payload object containing the user information that will be encoded into the token.
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    // JWT secret key ( used to sign the token )
    process.env.JWT_SECRET || // retrieved from an environment variable called JWT_SECRET
      "somethingsecret",
    {
      expiresIn: "30d", // token will expire after 30 days
    }
  );
};

/*  checks if a user is authenticated by verifying the 
    JWT token included in the request headers. */
export const isAuth = (
  req, // request object
  res, // response object
  next // callback function that moves the request to the next middleware in the chain.
) => {
  const authorization = req.headers.authorization;

  // checks if the authorization header is present in the request headers
  if (authorization) {
    /*If it is, the function extracts the token from the header by slicing the first 
    7 characters (which correspond to the string "Bearer ") and keeps the rest of the string. */
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX

    // The jwt.verify method takes in three arguments:
    jwt.verify(
      token, // the JWT to verify
      process.env.JWT_SECRET || // // retrieved from an environment variable called JWT_SECRET
        "somethingsecret", // the secret or key used to sign the JWT
      // a callback function that is executed after the verification process is complete.
      (err, decode) => {
        if (err) {
          /* If there is an error during the verification process,
           it sends a 401 status code and a message "Invalid Token".*/
          res.status(401).send({ message: "Invalid Token" });
        } else {
          // Otherwise
          /* it sets the decoded payload as req.user  */
          req.user = decode;
          /* calls the next() function to move on to the next middleware */
          next();
        }
      }
    );
  } else {
    // Otherwise, it sends a 401 status code and a message "No Token".*/
    res.status(401).send({ message: "No Token" });
  }
};

// This code defines a middleware function called isAdmin, which checks if the user making the request is an admin.
export const isAdmin = (
  req, // request object
  res, // response object
  next // callback function that moves the request to the next middleware in the chain.
) => {
  // checks if there's a req.user property and if it has an isAdmin property with true value.
  if (req.user && req.user.isAdmin) {
    //If this condition is true, meaning that the user is an admin
    //calls the next() function to move on to the next middleware function in the chain.
    next();
  } else {
    /* If the user is not an admin or does not have the valid token, 
    the function sends back an error message along with a status code 401 */
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

// This code defines a middleware function called isSeller, which checks if the user making the request is an Seller.
export const isSeller = (
  req, // request object
  res, // response object
  next // callback function that moves the request to the next middleware in the chain.
) => {
  // checks if the user making the request is a seller or not
  if (req.user && req.user.isSeller) {
    //  calls the next() function to pass on this middleware request to the next function in the list.
    next();
  } else {
    /* Otherwise, it responds with an HTTP status error code of 401 (i.e., unauthorized access)
       and sends an error message saying "Invalid Seller Token". */
    res.status(401).send({ message: "Invalid Seller Token" });
  }
};

// This code defines a middleware function called isSellerOrAdmin, which checks if the user making the request is an Seller or Admin.
export const isSellerOrAdmin = (
  req, // request object
  res, // response object
  next // a callback function that passes control to the next middleware in the application's request-response cycle.
) => {
  //  checks if the "req" object has a "user" property and whether that user is either an admin or a seller.
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    //invokes the "next()" function to pass control to the next middleware in the chain.
    next();
  } else {
    /* Otherwise, the function sets the HTTP status code to 401 (Unauthorized)
     and sends a message saying the user's token is invalid. */
    res.status(401).send({ message: "Invalid Admin/Seller Token" });
  }
};
