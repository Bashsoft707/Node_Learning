const express = require("express");
const {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
  bookPhotoUpload,
} = require("../controllers/books");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getBooks)
  .post(protect, authorize("publisher", "admin"), createBook);

router
  .route("/:id")
  .get(getBook)
  .put(protect, authorize("publisher", "admin"), updateBook)
  .delete(protect, authorize("publisher", "admin"), deleteBook);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bookPhotoUpload);

module.exports = router;
