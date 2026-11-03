const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isbn: { type: String, trim: true, unique: true, sparse: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
