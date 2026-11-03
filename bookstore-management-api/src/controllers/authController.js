const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "Email is already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  // Public registration always creates a normal user. Never accept role from request body.
  const user = await User.create({ name, email, password: hashedPassword, role: "user" });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id)
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = { register, login, getMe };
