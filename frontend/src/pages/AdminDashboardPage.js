import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { deleteCourse, getCourses } from "../services/courseService";
import { getApiErrorMessage } from "../services/api";

function AdminDashboardPage() {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCourses();
      setCourses(response.courses || []);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to load admin courses."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm("Delete this course permanently?");

    if (!confirmDelete) {
      return;
    }

    setDeletingCourseId(courseId);
    setError("");
    setSuccessMessage("");

    try {
      const response = await deleteCourse(courseId);
      setSuccessMessage(response.message || "Course deleted.");
      await loadCourses();
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to delete the course."));
    } finally {
      setDeletingCourseId("");
    }
  };

  return (
    <section className="page-section">
      <div className="hero-card">
        <div className="hero-card__content">
          <span className="pill">Admin control center</span>
          <h1>Manage courses, lessons, and quiz assessments.</h1>
          <p>
            Create new certification paths, update content, and remove outdated courses with
            JWT-protected admin actions.
          </p>
        </div>

        <div className="hero-card__aside">
          <div className="hero-stat">
            <strong>{courses.length}</strong>
            <span>Total courses in the catalog</span>
          </div>
          <Link className="button button--primary" to="/admin/courses/new">
            Create New Course
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="page-title">
          <h1>Course Management</h1>
          <p>Use the backend admin routes to create, update, and delete course content.</p>
        </div>

        <AlertMessage message={error} />
        <AlertMessage message={successMessage} type="success" />

        {loading ? <LoadingSpinner label="Loading admin dashboard..." /> : null}

        {!loading && !error && courses.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Create the first course to populate the platform."
            action={
              <Link className="button button--primary" to="/admin/courses/new">
                Create Course
              </Link>
            }
          />
        ) : null}

        {!loading && courses.length > 0 ? (
          <div className="admin-grid">
            {courses.map((course) => (
              <div className="admin-card" key={course._id}>
                <span className="pill">{course.lessons?.length || 0} lessons</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="admin-toolbar">
                  <Link className="button button--secondary" to={`/admin/courses/${course._id}/edit`}>
                    Edit
                  </Link>
                  <Link className="button button--ghost" to={`/courses/${course._id}`}>
                    Preview
                  </Link>
                  <button
                    className="button button--danger"
                    disabled={deletingCourseId === course._id}
                    onClick={() => handleDelete(course._id)}
                    type="button"
                  >
                    {deletingCourseId === course._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
