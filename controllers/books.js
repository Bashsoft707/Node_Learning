const Book = require("../models/Book");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { parse } = require("dotenv");

//      @desc Get all books
//      @route GET api/v1/books
//      @access Public
exports.getBooks = asyncHandler(async (req, res, next) => { 
  // inintialize/create a query
  let query;

  // Copy request.query
  const reqQuery = { ...req.query };

  // Fields to execute
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((params) => delete reqQuery[params]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Create operators [$gt, $gte, etc]
  query = Book.find(JSON.parse(queryStr));

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort data
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Book.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const books = await query;

  // Pagination
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: books.length,
    pagination,
    data: books,
  });
});

//      @desc Get a book
//      @route GET api/v1/books/:id
//      @access Public
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`Book with ${req.params.id} not found`, 400));
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

//      @desc Create a book
//      @route POST api/v1/books
//      @access Public
exports.createBook = asyncHandler(async (req, res, next) => {
  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    data: book,
  });
});

//      @desc Update a book
//      @route PUT api/v1/books/:id
//      @access Private
exports.updateBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    return next(new ErrorResponse(`Book with ${req.params.id} not found`, 400));
  }
  res.status(200).json({
    success: true,
    data: book,
  });
});

//      @desc Delete a book
//      @route DELETE api/v1/books/:id
//      @access Private
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`Book with ${req.params.id} not found`, 400));
  }

  book.remove();
  res.status(200).json({
    success: true,
    data: {},
  });
});

//      @desc Upload a photo
//      @route DELETE api/v1/books/:id/photo
//      @access Private
exports.bookPhotoUpload = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    next(new ErrorResponse(`Book with ${req.params.id} not found`, 400));
  }

  if (!req.files) {
    next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    next(new ErrorResponse(`Please upload an image`, 500));
  }

  if (file.size > process.env.IMAGE_SIZE) {
    next(new ErrorResponse(`Image upload file is too large`, 400));
  }

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.IMAGE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
    }

    await Book.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
