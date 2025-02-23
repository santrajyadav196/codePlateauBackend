require("dotenv").config();
require("./config/dbs/db")();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const morganMiddleware = require("./middleware/morganMiddleware.js");
const CustomError = require("./utils/CustomError");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const userRoutes = require("./routes/userRoute.js");

const PORT = process.env.PORT;

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // this is for parsing the body of the request when we use to get form data from the client side like ejs form or client side form rendering
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:5173", // Change this to your frontend URL
  credentials: true,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  // res.send("Hello, world!");
  res.render("index");
});

app.use("/api/auth", userRoutes);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  if (process.env.MODE === "development") {
    return next(new CustomError(`URL not found ${req.originalUrl}`, 404));
  }
  next(new CustomError(`Something went wrong!`, 404));
});

// Global error handler middleware
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
