
import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";

function Courses() {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- Filter states ----------
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // ---------- Load courses from backend ----------
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.get("/courses");

        // Backend returns the courses inside "courses"
        setCourses(response.data.courses || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  // ---------- Build category list ----------
  const categories = [
    "All",
    ...new Set(
      courses
        .map((course) => course.category)
        .filter(Boolean)
    ),
  ];

  // ---------- Level options ----------
  const levels = [
    "All",
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  // ---------- Apply all filters ----------
  const filteredCourses = courses.filter((course) => {
    /*
      Convert values to strings safely.

      This prevents errors when description or duration
      is null or undefined.
    */
    const title = String(course.title || "");
    const category = String(course.category || "");
    const level = String(course.level || "");
    const description = String(course.description || "");
    const duration = String(course.duration || "");

    const search = searchText.trim().toLowerCase();

    // ---------- Search filter ----------
    const matchesSearch =
      search === "" ||
      title.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search) ||
      level.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search) ||
      duration.toLowerCase().includes(search);

    // ---------- Category filter ----------
    const matchesCategory =
      selectedCategory === "All" ||
      category === selectedCategory;

    // ---------- Level filter ----------
    const matchesLevel =
      selectedLevel === "All" ||
      level.toLowerCase() === selectedLevel.toLowerCase();

    // ---------- Price ----------
    const price = Number(course.price);

    const matchesMinPrice =
      minPrice === "" ||
      (!Number.isNaN(price) && price >= Number(minPrice));

    const matchesMaxPrice =
      maxPrice === "" ||
      (!Number.isNaN(price) && price <= Number(maxPrice));

    /*
      AND logic:
      A course must satisfy ALL active filters.
    */
    return (
      matchesSearch &&
      matchesCategory &&
      matchesLevel &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  // ---------- Clear all filters ----------
  const clearAllFilters = () => {
    setSearchText("");
    setSelectedCategory("All");
    setSelectedLevel("All");
    setMinPrice("");
    setMaxPrice("");
  };

  // ---------- Check whether any filter is active ----------
  const hasActiveFilters =
    searchText.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedLevel !== "All" ||
    minPrice !== "" ||
    maxPrice !== "";

  return (
    <>
      <Navbar />

      <div className="container">
        {/* ---------- Page header ---------- */}
        <div className="page-header">
          <div>
            <h1>Our Courses</h1>

            <p className="page-subtitle">
              Browse the full catalogue and find a course
              that suits your needs.
            </p>
          </div>
        </div>

        {/* ---------- Filters ---------- */}
        {!loading && !error && courses.length > 0 && (
          <div className="filter-bar">
            {/* Search */}
            <input
              type="text"
              className="input"
              placeholder="Search by title, category, level, description or duration..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            {/* Category */}
            <select
              className="input"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

            {/* Level */}
            <select
              className="input"
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(event.target.value)
              }
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level === "All"
                    ? "All Levels"
                    : level}
                </option>
              ))}
            </select>

            {/* Minimum price */}
            <input
              type="number"
              className="input"
              placeholder="Minimum price"
              min="0"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
            />

            {/* Maximum price */}
            <input
              type="number"
              className="input"
              placeholder="Maximum price"
              min="0"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
            />

            {/* Clear All */}
            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* ---------- Active filter chips ---------- */}
        {!loading &&
          !error &&
          courses.length > 0 &&
          hasActiveFilters && (
            <div className="active-filters">
              <span className="filter-label">
                Active filters:
              </span>

              {searchText.trim() !== "" && (
                <span className="filter-chip">
                  Search: "{searchText}"
                </span>
              )}

              {selectedCategory !== "All" && (
                <span className="filter-chip">
                  Category: {selectedCategory}
                </span>
              )}

              {selectedLevel !== "All" && (
                <span className="filter-chip">
                  Level: {selectedLevel}
                </span>
              )}

              {minPrice !== "" && (
                <span className="filter-chip">
                  Min Price: {minPrice}
                </span>
              )}

              {maxPrice !== "" && (
                <span className="filter-chip">
                  Max Price: {maxPrice}
                </span>
              )}
            </div>
          )}

        {/* ---------- Loading state ---------- */}
        {loading && (
          <p className="loading">
            Loading courses...
          </p>
        )}

        {/* ---------- Error state ---------- */}
        {error && !loading && (
          <p className="error">
            {error}
          </p>
        )}

        {/* ---------- No courses exist ---------- */}
        {!loading &&
          !error &&
          courses.length === 0 && (
            <p className="empty">
              There are no courses available at the moment.
            </p>
          )}

        {/* ---------- Courses exist but no match ---------- */}
        {!loading &&
          !error &&
          courses.length > 0 &&
          filteredCourses.length === 0 && (
            <div className="empty">
              <p>
                No courses match the selected filters.
              </p>

              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}

        {/* ---------- Course list ---------- */}
        {!loading &&
          !error &&
          courses.length > 0 &&
          filteredCourses.length > 0 && (
            <>
              {/* ---------- Result counter ---------- */}
              <p className="result-count">
                Showing {filteredCourses.length} of{" "}
                {courses.length} courses
              </p>

              <div className="course-grid">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                  />
                ))}
              </div>
            </>
          )}
      </div>

      <Footer />
    </>
  );
}

export default Courses;
