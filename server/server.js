import http from "http";
import { Server } from "socket.io";
import express from "express";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import uploadRouter from "./routes/uploadRoutes.js";
import axios from "axios";

// {} []

// Defines the port that the server will listen on.
const port = process.env.PORT || 5000;

// Loads environment variables from a .env file into process.env.
dotenv.config();

// Creates a new Express application
const app = express();

// Adds middleware to parse JSON requests.
app.use(express.json());

// Adds middleware to parse form-urlencoded data.
app.use(express.urlencoded({ extended: true }));

// Sets strictQueries on Mongoose queries.
mongoose.set("strictQuery", true);
/* Connects to the MongoDB database specified in the .env file,
 or falls back to a local instance named ecommerce. */
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/ecommerce")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

app.use("/api/upload", uploadRouter);

// Registers the productRouter under "/api/products".
app.use("/api/products", productRouter);

// Registers the userRouter under "/api/users".
app.use("/api/users", userRouter);

// Registers the orderRouter under "/api/orders".
app.use("/api/orders", orderRouter);

app.get(
  "/api/keys/paypal", // route
  (req, res) => {
    res.send(
      process.env.PAYPAL_CLIENT_ID || // sends back the PayPal client ID  OR
        "sb" // a default string
    );
  }
);

// define __dirname (absolute path)
// resolve a sequence of path-segments to an absolute path
const __dirname = path.resolve();

app.use(
  "/uploads", // path
  // creates an express app that serves static files
  express.static(
    // join all arguments together and normalize the resulting path
    path.join(
      __dirname, // absolute path
      "/upload" // path
    )
  ) // callback
);

/* used to mount the specified middleware function(s) 
  at the path which is being specified */
app.use(
  // creates an express app that serves static files
  express.static(
    // join all arguments together and normalize the resulting path
    path.join(
      __dirname, // absolute path
      "/client/dist" // path
    )
  ) // callback
);

app.get(
  "*", // path
  (
    req, // get request
    res // get response
  ) =>
    // response - transfers the file at the given path
    res.sendFile(
      // join all arguments together and normalize the resulting path
      path.join(
        __dirname, // absolute path
        "../../client/dist/index.html" // path
      )
    ) // callback
);

/* used to mount the specified middleware function(s) 
    at the path which is being specified */
app.use(
  (
    err, // get error
    req, // get request
    res, // get response
    next // get next
  ) => {
    // Sends the HTTP response | status code 500 | message: err.message
    res.status(500).send({ message: err.message });
  } // callback
);

// create httpServer
const httpServer = http.Server(app);

// create server
const io = new Server(
  httpServer,
  {
    cors: {
      origin: "*", // path
    },
  } //Cross-Origin Resource Sharing ( cors )
);

// set users with empty array
const users = [];

// connection
io.on(
  "connection", // 1st arg: 'connection' string
  (
    socket // arg: socket
  ) => {
    console.log("connection", socket.id);

    // disconnect
    socket.on(
      "disconnect", // 1st arg: 'disconnect' string
      () => {
        // define user
        const user = users.find(
          // find x
          (x) => x.socketId === socket.id
        );

        // check user
        if (user) {
          // set user.online to false
          user.online = false;

          console.log("Offline", user.name);

          // find user that is admin and does onliine
          const admin = users.find(
            // user isAdmin and does online
            (x) => x.isAdmin && x.online
          );

          // check admin
          if (admin) {
            // targets a room when emitting
            io.to(
              admin.socketId // room
            )
              /* emits to all clients */
              .emit(
                "updateUser", // 1st arg: 'updateUser' ( string )
                user // 2nd arg: user ( object )
              );
          }
        }
      } // 2nd arg: arrow function
    );

    // onLogin
    socket.on(
      "onLogin", // 1st arg: 'onLogin' string
      (
        user // arg: user ( object )
      ) => {
        // define updatedUser
        const updatedUser = {
          ...user,
          online: true,
          socketId: socket.id,
          messages: [],
        };

        // define existUser
        const existUser = users.find(
          // check user id
          (x) => x._id === updatedUser._id
        );

        // check existUser
        if (existUser) {
          // true
          existUser.socketId = socket.id;
          existUser.online = true;
        } else {
          // false
          // append updatedUser to the end of users array
          users.push(updatedUser);
        }

        console.log("Online", user.name);

        // define admin
        const admin = users.find(
          // check if user isAdmin and does online
          (x) => x.isAdmin && x.online
        );

        // check admin
        if (admin) {
          // targets a room when emitting
          io.to(
            admin.socketId // 1st arg
            // emits to all clients
          ).emit(
            "updateUser", // 1st arg: 'updateUser' ( string )
            updatedUser // 2nd arg: updatedUser ( object )
          );
        }

        // check updatedUser.isAdmin
        if (updatedUser.isAdmin) {
          // targets a room when emitting
          io.to(updatedUser.socketId)
            // emits to all users
            .emit(
              "listUsers", // 1st arg: 'updateUser' ( string )
              users // 2nd arg: users ( array )
            );
        }
      } // 2nd arg: arrow function
    );

    // onUserSelected
    socket.on(
      "onUserSelected", // 1st arg: 'onUserSelected' string

      (
        user //  arg: user ( object )
      ) => {
        // define user that isAdmin and is online
        const admin = users.find((x) => x.isAdmin && x.online);

        // check admin
        if (admin) {
          // true

          // existUser by id
          const existUser = users.find(
            // check ids
            (x) => x._id === user._id
          );

          // targets a room when emitting
          io.to(
            admin.socketId // arg : admin.socketId ( room )
            // emits to all clients
          ).emit(
            "selectUser", // 1st arg: 'selectUser'
            existUser // 2nd arg: existUser
          );
        }
      } // 2nd arg: arrow function
    );

    // onMessage
    socket.on(
      "onMessage", // 1st arg: 'onMessage' string
      (
        message // arg: message
      ) => {
        // check message.isAdmin
        if (message.isAdmin) {
          // true
          // define user
          const user = users.find((x) => x._id === message._id && x.online);

          // check user
          if (user) {
            // true
            // targets a room when emitting
            io.to(
              user.socketId // room
            )
              // emits to all clients
              .emit(
                "message", // 1st arg: 'message'
                message // 2nd arg: message ( object )
              );

            // append message to the end of messages array
            user.messages.push(
              message // arg: message
            );
          }
        } else {
          // false

          // define admin
          const admin = users.find(
            // find user ( isAdmin and is online ) in users ( array )
            (x) => x.isAdmin && x.online
          );

          // check admin
          if (admin) {
            // true
            // targets a room when emitting
            io.to(
              admin.socketId // room
            )
              // emits to all clients
              .emit(
                "message", // 1st arg: 'message' ( str )
                message // 2nd arg: message ( obj )
              );

            // define user
            const user = users.find(
              // find user in users array
              (x) => x._id === message._id && x.online
            );

            // append message to the end of messages array
            user.messages.push(message);
          } else {
            // targets a room when emitting
            io.to(socket.id)
              // emits to all clients
              .emit(
                "message", // 1st arg: 'message'
                {
                  name: "Admin",
                  body: "Sorry. I am not online right now",
                } // 2nd arg: object
              );
          }
        }
      } // 2nd arg: arrow function
    );
  } // 2nd arg: function
);

/* Starts the server listening on the specified port 
and logs a message indicating the server is running. */
httpServer.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
