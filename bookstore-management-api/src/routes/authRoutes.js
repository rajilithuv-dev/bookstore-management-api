const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2 to 60 characters."),
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must contain at least 8 characters.")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validateRequest,
  login
);

router.get("/me", protect, getMe);

module.exports = router;
