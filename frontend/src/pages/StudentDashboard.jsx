
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaEye,
  FaGraduationCap,
  FaSearch,
} from "react-icons/fa";

import api from "../services/api";
import { getUser } from "../services/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const emptyReport = {
  enrolledCourses: 0,
  distinctCategories: 0,
  earliestEnrollmentDate: null,
  latestEnrollmentDate: null,
  recentEnrollments: [],
};

function StudentDashboard() {
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/reports/my");

        if (active) {
          setReport({
            ...emptyReport,
            ...(response.data.report || {}),
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Failed to load your learning report."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "No enrollment yet";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString();
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>Student Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, {user?.full_name || user?.username}!
              Here is your learning activity.
            </p>
          </div>

          <Link to="/courses" className="btn btn-primary">
            <FaSearch /> Browse Courses
          </Link>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {/* CR-009: Personal statistics */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="dashboard-card-value">
              {loading ? "..." : Number(report.enrolledCourses) || 0}
            </span>
            <span className="dashboard-card-label">
              My Enrolled Courses
            </span>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-value">
              {loading ? "..." : Number(report.distinctCategories) || 0}
            </span>
            <span className="dashboard-card-label">
              Distinct Categories
            </span>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-date">
              {loading
                ? "..."
                : formatDate(report.earliestEnrollmentDate)}
            </span>
            <span className="dashboard-card-label">
              Earliest Enrollment
            </span>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-date">
              {loading
                ? "..."
                : formatDate(report.latestEnrollmentDate)}
            </span>
            <span className="dashboard-card-label">
              Latest Enrollment
            </span>
          </div>
        </div>

        {/* Recent enrollments for this student */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>My Recent Enrollments</h2>

            <Link to="/my-enrollments" className="link-inline">
              <FaEye /> View all
            </Link>
          </div>

          {loading ? (
            <p className="loading">Loading your report...</p>
          ) : report.recentEnrollments.length === 0 ? (
            <p className="empty">
              You have not enrolled in any courses yet. Browse courses
              to start your learning journey.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Enrolled On</th>
                  </tr>
                </thead>

                <tbody>
                  {report.recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <Link to={`/courses/${enrollment.course_id}`}>
                          {enrollment.title}
                        </Link>
                      </td>
                      <td>
                        {enrollment.category || "Uncategorized"}
                      </td>
                      <td>{enrollment.level || "-"}</td>
                      <td>{formatDate(enrollment.enrolled_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Student quick actions */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">
            <Link to="/courses" className="quick-action">
              <span className="quick-action-icon"><FaBook /></span>
              <span>Browse all courses</span>
            </Link>

            <Link to="/my-enrollments" className="quick-action">
              <span className="quick-action-icon">
                <FaGraduationCap />
              </span>
              <span>View my enrollments</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default StudentDashboard;
