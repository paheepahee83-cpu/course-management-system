
const Report = require("../models/reportModel");

const getOverview = async (req, res) => {
  try {
    const report = await Report.getOverview();

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Admin report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load the admin report.",
    });
  }
};

const getMyReport = async (req, res) => {
  try {
    // The student ID comes from the authenticated JWT.
    // Never accept a student ID from the request query or body.
    const studentId = req.user.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user information is missing.",
      });
    }

    const report = await Report.getMyReport(studentId);

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Student report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your report.",
    });
  }
};

module.exports = {
  getOverview,
  getMyReport,
};
