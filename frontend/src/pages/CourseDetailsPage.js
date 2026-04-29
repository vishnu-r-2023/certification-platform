import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import EmptyState from "../components/EmptyState";
import { getCourseById } from "../services/courseService";
import { getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCourseById(courseId);
        setCourse(response.course);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Unable to load this course."));
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/quiz/${courseId}` } } });
      return;
    }

    navigate(`/quiz/${courseId}`);
  };

  if (loading) {
    return (
      <section className="page-section">
        <LoadingSpinner label="Loading course details..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <AlertMessage message={error} />
      </section>
    );
  }

  if (!course) {
    return (
      <section className="page-section">
        <EmptyState title="Course not found" description="The requested course does not exist." />
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="hero-card">
        <div className="hero-card__content">
          <span className="pill">Course overview</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>

          <div className="hero-card__actions">
            <button className="button button--primary" onClick={handleStartQuiz} type="button">
              Start Quiz
            </button>
            {isAdmin ? (
              <Link className="button button--secondary" to={`/admin/courses/${courseId}/edit`}>
                Edit Course
              </Link>
            ) : null}
          </div>
        </div>

        <div className="hero-card__aside">
          <div className="hero-stat">
            <strong>{course.lessons?.length || 0}</strong>
            <span>Lessons in this course</span>
          </div>
          <div className="hero-stat">
            <strong>{course.quiz?.length || 0}</strong>
            <span>Quiz questions</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="page-title">
          <h1>Lessons</h1>
          <p>Each lesson includes the exact video URL configured by the admin.</p>
        </div>

        {course.lessons?.length ? (
          <div className="lesson-list">
            {course.lessons.map((lesson, index) => (
              <div className="lesson-item" key={`${lesson.title}-${index}`}>
                <div className="split-header">
                  <strong>{lesson.title}</strong>
                  <span className="pill pill--soft">Lesson {index + 1}</span>
                </div>
                <p>
                  Video URL:{" "}
                  <a href={lesson.videoUrl} rel="noreferrer" target="_blank">
                    {lesson.videoUrl}
                  </a>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lessons added yet"
            description="An admin needs to add lesson content before learners can explore this course."
          />
        )}
      </div>

      <div className="content-card">
        <div className="page-title">
          <h1>Quiz Preview</h1>
          <p>
            The backend hides correct answers on public course endpoints, so this preview shows
            question prompts and options only.
          </p>
        </div>

        {course.quiz?.length ? (
          <div className="quiz-list">
            {course.quiz.map((question, index) => (
              <div className="question-card" key={`${question.question}-${index}`}>
                <div className="question-card__head">
                  <div className="question-card__number">{index + 1}</div>
                  <div>
                    <strong>{question.question}</strong>
                    <p className="muted">{question.options?.length || 0} options available</p>
                  </div>
                </div>

                <div className="option-list">
                  {question.options?.map((option, optionIndex) => (
                    <div className="option-card" key={`${option}-${optionIndex}`}>
                      <span className="pill pill--soft">Option {optionIndex + 1}</span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Quiz not available yet"
            description="This course does not have quiz questions at the moment."
          />
        )}
      </div>
    </section>
  );
}

export default CourseDetailsPage;
