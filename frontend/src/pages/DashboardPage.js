import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import { useAuth } from "../context/AuthContext";
import { getCourses } from "../services/courseService";
import { getApiErrorMessage } from "../services/api";

function DashboardPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
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
        setError(getApiErrorMessage(apiError, "Unable to load dashboard courses."));
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const enrolledIds = Array.isArray(user?.enrolledCourses) ? user.enrolledCourses : [];
  const enrolledCourses = courses.filter((course) => enrolledIds.includes(course._id));

  return (
    <section className="page-section">
      <div className="hero-card">
        <div className="hero-card__content">
          <span className="pill">Learner dashboard</span>
          <h1>{user?.name}, keep your progress moving.</h1>
          <p>
            This dashboard uses the `enrolledCourses` array from the backend user model and
            updates locally after quiz submission for a seamless experience.
          </p>
        </div>

        <div className="hero-card__aside">
          <div className="hero-stat">
            <strong>{enrolledCourses.length}</strong>
            <span>Courses in your dashboard</span>
          </div>
          <div className="glass-tile">
            <strong>Role</strong>
            <p className="muted">{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="page-title">
          <h1>Your Enrolled Courses</h1>
          <p>Each course appears here after you submit its quiz at least once.</p>
        </div>

        <AlertMessage message={error} />
        {loading ? <LoadingSpinner label="Loading your dashboard..." /> : null}

        {!loading && !error && enrolledCourses.length === 0 ? (
          <EmptyState
            title="No enrolled courses yet"
            description="Start with the course catalog, then take a quiz to add a course to your dashboard."
            action={
              <Link className="button button--primary" to="/">
                Explore Courses
              </Link>
            }
          />
        ) : null}

        {!loading && enrolledCourses.length > 0 ? (
          <div className="dashboard-grid">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                footerContent={
                  <div className="card-actions">
                    <Link className="button button--secondary" to={`/courses/${course._id}`}>
                      Continue
                    </Link>
                    <Link className="button button--ghost" to={`/certificate/${course._id}`}>
                      Certificate
                    </Link>
                  </div>
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default DashboardPage;
