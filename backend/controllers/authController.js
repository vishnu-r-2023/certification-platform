const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("A user with this email already exists.");
  }

  let assignedRole = "user";

  if (role === "admin") {
    if (
      !process.env.ADMIN_REGISTRATION_SECRET ||
      adminSecret !== process.env.ADMIN_REGISTRATION_SECRET
    ) {
      res.status(403);
      throw new Error("Valid admin secret is required to register an admin.");
    }

    assignedRole = "admin";
  }

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    token: generateToken(user._id),
    user
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token: generateToken(user._id),
    user: user.toJSON()
  });
});

module.exports = {
  registerUser,
  loginUser
};
