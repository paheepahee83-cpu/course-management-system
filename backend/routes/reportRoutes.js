
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  roleMiddleware,
} = require("../middleware/authMiddleware");

const {
  getOverview,
  getMyReport,
} = require("../controllers/reportController");

const router = express.Router();

// Admin-only system report
router.get(
  "/overview",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOverview
);

// Student-only personal report
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyReport
);

module.exports = router;
