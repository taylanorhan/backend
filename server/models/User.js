const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  age: { type: Number, required: true },
  isAdmin: { type: Boolean, default: false },
});

// Hash password before saving
UserSchema.pre("save", function () {});

module.exports = mongoose.model("User", UserSchema);
