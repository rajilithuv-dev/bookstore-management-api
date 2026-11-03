const express = require("express");
const { body, param } = require("express-validator");
const {
  getBooks, getBookById, createBook, updateBook, deleteBook
} = require("../controllers/bookController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

const bookValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("author").trim().notEmpty().withMessage("Author is required."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be zero or greater."),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
  body("isbn").optional({ values: "falsy" }).trim()
];

router.get("/", getBooks);
router.get("/:id", param("id").isMongoId().withMessage("Invalid book ID."), validateRequest, getBookById);

router.post("/", protect, authorizeRoles("admin"), bookValidation, validateRequest, createBook);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  param("id").isMongoId().withMessage("Invalid book ID."),
  ...bookValidation,
  validateRequest,
  updateBook
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  param("id").isMongoId().withMessage("Invalid book ID."),
  validateRequest,
  deleteBook
);

module.exports = router;
