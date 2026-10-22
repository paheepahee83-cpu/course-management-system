
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaChartBar,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

import api from "../services/api";
import { getUser } from "../services/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const emptyReport = {
  totalCourses: 0,
  totalStudents: 0,
  totalEnrollments: 0,
  studentsWithEnrollments: 0,
  enrollmentsLast30Days: 0,
  categoryBreakdown: [],
  topCourses: [],
  coursesWithoutEnrollments: 0,
  recentEnrollments: [],
};

function AdminDashboard() {
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await api.get("/reports/overview");

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
              "Failed to load reporting data."
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
    if (!value) return "-";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString();
  };

  const maxCategoryCount = Math.max(
    1,
    ...report.categoryBreakdown.map(
      (item) => Number(item.enrollmentCount) || 0
    )
  );

  const statistics = [
    ["Total Courses", report.totalCourses],
    ["Total Students", report.totalStudents],
    ["Total Enrollments", report.totalEnrollments],
    ["Students with Enrollments", report.studentsWithEnrollments],
    ["Enrollments in Last 30 Days", report.enrollmentsLast30Days],
    ["Courses without Enrollments", report.coursesWithoutEnrollments],
  ];

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, {user?.full_name || user?.username}.
              Here is an overview of the system.
            </p>
          </div>

          <Link to="/admin/courses" className="btn btn-primary">
            <FaChartBar /> Manage Courses
          </Link>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        {/* CR-009: Reporting summary */}
        <div className="dashboard-grid">
          {statistics.map(([label, value]) => (
            <div className="dashboard-card" key={label}>
              <span className="dashboard-card-value">
                {loading ? "..." : Number(value) || 0}
              </span>
              <span className="dashboard-card-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>Enrollments by Category</h2>
          </div>

          {loading ? (
            <p className="loading">Loading category report...</p>
          ) : report.categoryBreakdown.length === 0 ? (
            <p className="empty">No categories available.</p>
          ) : (
            <div className="report-bars">
              {report.categoryBreakdown.map((item, index) => {
                const count = Number(item.enrollmentCount) || 0;
                const width = (count / maxCategoryCount) * 100;

                return (
                  <div
                    className="report-bar-item"
                    key={`${item.category}-${index}`}
                  >
                    <div className="report-bar-heading">
                      <span>{item.category || "Uncategorized"}</span>
                      <strong>{count}</strong>
                    </div>

                    <div
                      className="report-bar-track"
                      role="img"
                      aria-label={`${item.category}: ${count} enrollments`}
                    >
                      <div
                        className="report-bar-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Top five courses */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>Top Five Courses by Enrollment</h2>
          </div>

          {loading ? (
            <p className="loading">Loading top courses...</p>
          ) : report.topCourses.length === 0 ? (
            <p className="empty">No courses available.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Enrollments</th>
                  </tr>
                </thead>

                <tbody>
                  {report.topCourses.map((course, index) => (
                    <tr key={course.courseId}>
                      <td>{index + 1}</td>
                      <td>{course.title}</td>
                      <td>{course.category}</td>
                      <td>{Number(course.enrollmentCount) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent enrollments */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>Recent Enrollments</h2>

            <Link to="/admin/enrollments" className="link-inline">
              Manage enrollments
            </Link>
          </div>

          {loading ? (
            <p className="loading">Loading enrollments...</p>
          ) : report.recentEnrollments.length === 0 ? (
            <p className="empty">No enrollments have been made yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Username</th>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Enrolled On</th>
                  </tr>
                </thead>

                <tbody>
                  {report.recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.full_name}</td>
                      <td>{enrollment.username}</td>
                      <td>{enrollment.title}</td>
                      <td>
                        {enrollment.category || "Uncategorized"}
                      </td>
                      <td>
                        <span className="tag tag-level">
                          {enrollment.level || "-"}
                        </span>
                      </td>
                      <td>{formatDate(enrollment.enrolled_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Administration shortcuts */}
        <section className="section-card">
          <div className="section-card-header">
            <h2>Administration</h2>
          </div>

          <div className="quick-actions">
            <Link to="/admin/courses" className="quick-action">
              <span className="quick-action-icon"><FaBook /></span>
              <span>Add, edit and delete courses</span>
            </Link>

            <Link to="/admin/enrollments" className="quick-action">
              <span className="quick-action-icon"><FaUsers /></span>
              <span>View and remove enrollments</span>
            </Link>

            <Link to="/courses" className="quick-action">
              <span className="quick-action-icon"><FaSearch /></span>
              <span>See the public course list</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AdminDashboard;
