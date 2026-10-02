import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "studyflow_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, error: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
          readingStats: user.readingStats,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, error: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
