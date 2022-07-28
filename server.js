const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require('cookie-parser')
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const morgan = require("morgan");

dotenv.config({ path: "./config/config.env" });

const app = express();

// Connect to Database
connectDB();

const books = require("./routes/book");
const auth = require("./routes/auth");

// Dev logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json());

// Cookie parser
app.use(cookieParser())

// image file upload
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/books", books);
app.use("/api/v1/auth", auth);

// Error Handlers
app.use(errorHandler);

// Server port
const PORT = process.env.PORT || 5000; 

const server = app.listen(
  PORT,
  console.log(`Sever running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // close Server
  server.close(() => process.exit(1));
});
