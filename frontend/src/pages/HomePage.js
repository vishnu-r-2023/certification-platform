import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import EmptyState from "../components/EmptyState";
import { getCourses } from "../services/courseService";
import { getApiErrorMessage } from "../services/api";

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCourses();
        setCourses(response.courses || []);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Could not load courses."));
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      course.title.toLowerCase().includes(normalizedSearch) ||
      course.description.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <section className="page-section">
      <div className="hero-card">
        <div className="hero-card__content">
          <span className="pill">Certification-ready learning</span>
          <h1>Learn practical skills. Pass the quiz. Earn the certificate.</h1>
          <p>
            Explore structured courses with lessons, assessments, progress tracking, and
            printable certificates backed by your Node and MongoDB API.
          </p>

          <div className="hero-card__actions">
            <Link className="button button--primary" to="/register">
              Create Account
            </Link>
            <Link className="button button--ghost" to="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-card__aside">
          <div className="hero-stat">
            <strong>{courses.length}</strong>
            <span>Courses available now</span>
          </div>
          <div className="glass-tile">
            <strong>Backend-aware frontend</strong>
            <p className="muted">
              Request formats, result handling, and protected routes match the backend responses
              exactly.
            </p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="split-header">
          <div className="page-title">
            <h1>Available Courses</h1>
            <p>Browse courses, read the lesson outline, and start a quiz when you are ready.</p>
          </div>

          <div className="field-group" style={{ marginBottom: 0, minWidth: "280px" }}>
            <label htmlFor="searchCourses">Search courses</label>
            <input
              id="searchCourses"
              placeholder="Search by title or description"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </div>

        <AlertMessage message={error} />
        {loading ? <LoadingSpinner label="Loading courses..." /> : null}

        {!loading && !error && filteredCourses.length === 0 ? (
          <EmptyState
            title="No matching courses"
            description="Try a different search or ask an admin to create more content."
          />
        ) : null}

        {!loading && filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default HomePage;
