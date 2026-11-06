
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  FaChartBar,
  FaGraduationCap,
  FaShoppingCart,
  FaSignInAlt,
} from "react-icons/fa";

import api from "../services/api";
import { isLoggedIn, isStudent, isAdmin } from "../services/auth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Read login state
  const loggedIn = isLoggedIn();
  const studentLoggedIn = isStudent();
  const adminLoggedIn = isAdmin();

  // ---------- Load the course ----------
  useEffect(() => {
    const getCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data.course);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load course"
        );
      } finally {
        setLoading(false);
      }
    };

    getCourse();
  }, [id]);

  // ---------- Submit Enrollment Request ----------
  const handleEnroll = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await api.post("/enrollments", {
        courseId: id,
      });

      setSuccess(
        response.data.message ||
          "Your enrollment request has been submitted successfully. Waiting for admin approval."
      );
    } catch (error) {
      const status = error.response?.status;

      if (status === 409) {
        setError(
          error.response?.data?.message ||
            "You already have a pending or approved enrollment for this course."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to submit enrollment request. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="loading">Loading course...</p>
        </div>
        <Footer />
      </>
    );
  }

  // ---------- Course not found ----------
  if (error && !course) {
    return (
      <>
        <Navbar />

        <div className="container">
          <p className="error">{error}</p>

          <div className="center-actions">
            <Link to="/courses" className="btn btn-primary">
              Back to Courses
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container">
        {/* Breadcrumb */}
        <p className="breadcrumb">
          <Link to="/courses">Courses</Link>
          <span> / </span>
          <span>{course.title}</span>
        </p>

        <div className="details-layout">
          {/* ---------- Left: Image ---------- */}
          <div className="details-image-wrapper">
            <img
              src={course.image}
              alt={course.title}
              className="details-image"
            />
          </div>

          {/* ---------- Right: Information ---------- */}
          <div className="details-info">
            <div className="course-card-tags">
              <span className="tag tag-category">
                {course.category}
              </span>

              <span className="tag tag-level">
                {course.level}
              </span>
            </div>

            <h1>{course.title}</h1>

            <p className="details-description">
              {course.description}
            </p>

            <dl className="details-list">
              <div>
                <dt>Category</dt>
                <dd>{course.category}</dd>
              </div>

              <div>
                <dt>Level</dt>
                <dd>{course.level}</dd>
              </div>

              <div>
                <dt>Duration</dt>
                <dd>{course.duration}</dd>
              </div>

              <div>
                <dt>Price</dt>
                <dd className="details-price">
                  Rs. {course.price}
                </dd>
              </div>
            </dl>

            {/* ---------- Messages ---------- */}
            {success && (
              <p className="success">{success}</p>
            )}

            {error && (
              <p className="error">{error}</p>
            )}

            {/* ---------- Action Area ---------- */}
            <div className="details-actions">
              {/* Not logged in */}
              {!loggedIn && (
                <div className="notice">
                  <p>
                    Please login as a student to request
                    enrollment in this course.
                  </p>

                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="btn btn-primary"
                  >
                    <FaSignInAlt />
                    Login to Enroll
                  </Link>
                </div>
              )}

              {/* Student */}
              {studentLoggedIn && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleEnroll}
                    disabled={submitting}
                  >
                    <FaShoppingCart />

                    {submitting
                      ? "Submitting Request..."
                      : "Request Enrollment"}
                  </button>

                  <Link
                    to="/my-enrollments"
                    className="btn btn-outline"
                  >
                    <FaGraduationCap />
                    My Enrollments
                  </Link>

                  <p className="page-subtitle">
                    Your enrollment request will remain pending
                    until an administrator approves or rejects it.
                  </p>
                </>
              )}

              {/* Admin */}
              {adminLoggedIn && (
                <div className="notice">
                  <p>
                    You are logged in as an administrator.
                    Only students can request enrollment in courses.
                  </p>

                  <Link
                    to="/admin/courses"
                    className="btn btn-primary"
                  >
                    <FaChartBar />
                    Manage Courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default CourseDetails;
