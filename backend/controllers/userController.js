
const User = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
} = require("../helpers/hashPassword");

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const failedPasswordAttempts = new Map();

const getUserId = (req) => Number(req.user?.id);

const isAdmin = (req) =>
  String(req.user?.role || "").toLowerCase() === "admin";

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!isAdmin(req) && getUserId(req) !== Number(user.id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json({
      message: "User found",
      user,
    });
  } catch (error) {
    console.error("Find user by ID error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findByUsername(req.params.username);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!isAdmin(req) && getUserId(req) !== Number(user.id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      message: "User found",
      user: safeUser,
    });
  } catch (error) {
    console.error("Find user by username error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid authenticated user." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// PUT /api/users/me
const updateMyProfile = async (req, res) => {
  try {
    const fields = Object.keys(req.body || {});

    if (fields.some((field) => field !== "full_name")) {
      return res.status(400).json({
        message: "Only full_name can be updated.",
        errors: {
          full_name: "Username and role cannot be changed.",
        },
      });
    }

    if (typeof req.body?.full_name !== "string") {
      return res.status(400).json({
        message: "Full name is required.",
        errors: { full_name: "Enter your full name." },
      });
    }

    const fullName = req.body.full_name.trim();

    if (fullName.length < 3 || fullName.length > 100) {
      return res.status(400).json({
        message: "Full name must be between 3 and 100 characters.",
        errors: {
          full_name: "Enter 3 to 100 characters.",
        },
      });
    }

    const user = await User.updateFullName(getUserId(req), fullName);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// PUT /api/users/me/password
const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    const userId = getUserId(req);
    const now = Date.now();

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "All password fields are required.",
        errors: {
          currentPassword: "Enter your current password.",
          newPassword: "Enter a new password.",
          confirmPassword: "Confirm your new password.",
        },
      });
    }

    const attempt = failedPasswordAttempts.get(userId);

    if (attempt?.lockedUntil && now < attempt.lockedUntil) {
      res.set(
        "Retry-After",
        String(Math.ceil((attempt.lockedUntil - now) / 1000))
      );

      return res.status(429).json({
        message: "Too many failed attempts. Try again later.",
      });
    }

    if (attempt?.lockedUntil && now >= attempt.lockedUntil) {
      failedPasswordAttempts.delete(userId);
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must contain at least 8 characters.",
        errors: { newPassword: "Use at least 8 characters." },
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        message: "New password exceeds bcrypt's 72-byte limit.",
        errors: { newPassword: "Maximum length is 72 UTF-8 bytes." },
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Password confirmation does not match.",
        errors: { confirmPassword: "Passwords do not match." },
      });
    }

    const currentHash = await User.getPasswordHashById(userId);

    if (!currentHash) {
      return res.status(404).json({ message: "User not found." });
    }

    const validCurrentPassword = await comparePassword(
      currentPassword,
      currentHash
    );

    if (!validCurrentPassword) {
      const failures = (attempt?.failures || 0) + 1;

      if (failures >= MAX_FAILED_ATTEMPTS) {
        failedPasswordAttempts.set(userId, {
          failures,
          lockedUntil: now + LOCK_DURATION_MS,
        });

        res.set("Retry-After", String(LOCK_DURATION_MS / 1000));

        return res.status(429).json({
          message: "Too many failed attempts. Try again in 15 minutes.",
        });
      }

      failedPasswordAttempts.set(userId, { failures });

      return res.status(401).json({
        message: "Current password is incorrect.",
        remainingAttempts: MAX_FAILED_ATTEMPTS - failures,
      });
    }

    failedPasswordAttempts.delete(userId);

    if (await comparePassword(newPassword, currentHash)) {
      return res.status(400).json({
        message: "New password must differ from the current password.",
        errors: { newPassword: "Choose a different password." },
      });
    }

    const newHash = await hashPassword(newPassword);
    await User.updatePassword(userId, newHash);

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
};
