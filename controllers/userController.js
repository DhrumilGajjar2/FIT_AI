const User = require("../models/User");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;

    if (!name || !email || !password || !age || !weight || !height) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password, // Keeping plain text as requested
      age,
      weight,
      height,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      age: newUser.age,
      weight: newUser.weight,
      height: newUser.height,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      weight: user.weight,
      height: user.height,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    .select("-password")
    .populate("recommendationHistory");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      weight: user.weight,
      height: user.height,
      recommendationHistory: user.recommendationHistory,
    });
  } catch(error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({ error: "Server error. Please try again later."})
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
