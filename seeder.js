const mongoose = require("mongoose");
const fs = require("fs");
const Book = require("./models/Book");
const dotenv = require("dotenv");

// Load environment vars
dotenv.config({ path: "./config/config.env" });

// connect to db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sync file
const books = JSON.parse(fs.readFileSync(`${__dirname}/_data/books.json`));

// import Data
const importData = async () => {
  await Book.create(books);

  console.log("Data imported....");

  process.exit();
};

// Delete Data
const deleteData = async () => {
  await Book.deleteMany();

  console.log("Data destroyed....");

  process.exit();
};

// check process argument to execute import/delete data function
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
