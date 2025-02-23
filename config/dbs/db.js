const mongoose = require("mongoose");

let connectionURI;

if (process.env.NODE_ENV === "production") {
  connectionURI = process.env.PROD_DB_URI;
} else {
  connectionURI = process.env.DEV_DB_URI;
}

const connectDB = async () => {
  try {
    await mongoose.connect(connectionURI);
    console.log(`MongoDB connected in ${process.env.NODE_ENV} mode`);
  } catch (error) {
    console.log("Database connection failed");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
