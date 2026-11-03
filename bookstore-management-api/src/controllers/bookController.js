const Book = require("../models/Book");
const asyncHandler = require("../utils/asyncHandler");

const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = {};

  if (req.query.category) filter.category = new RegExp(req.query.category, "i");
  if (req.query.search) {
    filter.$or = [
      { title: new RegExp(req.query.search, "i") },
      { author: new RegExp(req.query.search, "i") }
    ];
  }

  const [books, total] = await Promise.all([
    Book.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Book.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: books.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: books
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: "Book not found." });
  res.status(200).json({ success: true, data: book });
});

const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, message: "Book created successfully", data: book });
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!book) return res.status(404).json({ success: false, message: "Book not found." });
  res.status(200).json({ success: true, message: "Book updated successfully", data: book });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: "Book not found." });
  res.status(200).json({ success: true, message: "Book deleted successfully" });
});

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
