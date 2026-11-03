require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const name = process.env.ADMIN_NAME || "Bookstore Admin";
    const email = (process.env.ADMIN_EMAIL || "admin@bookstore.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "Admin@12345";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({ name, email, password: hashedPassword, role: "admin" });
      console.log(`Admin created: ${email}`);
      console.log("Use the ADMIN_PASSWORD value from your .env file to log in.");
    }
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
