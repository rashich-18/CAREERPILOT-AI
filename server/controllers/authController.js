import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import crypto from "crypto";
import { sendPasswordResetOtp } from "../services/emailService.js";

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password , confirmPassword} = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields.",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

    // Don't return password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields.",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// Forgot Password: Generate and send OTP
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email.",
      });
    }

    const user = await User.findOne({ email });

    // Same response whether the account exists or not.
    const message = "If an account exists, an OTP will be sent to its email.";

    if (!user) {
      return res.status(200).json({ success: true, message });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetPasswordOtp = hashOtp(otp);
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetOtp(email, otp);
    } catch (emailError) {
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpiry = null;
      await user.save();
      throw emailError;
    }

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again later.",
    });
  }
};

// Verify OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetPasswordOtp ||
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date() ||
      user.resetPasswordOtp !== hashOtp(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, uppercase, lowercase, number and special character.",
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetPasswordOtp ||
      !user.resetPasswordOtpExpiry ||
      user.resetPasswordOtpExpiry < new Date() ||
      user.resetPasswordOtp !== hashOtp(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};
