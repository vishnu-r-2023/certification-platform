import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";
import EmptyState from "../components/EmptyState";
import { getCourseById } from "../services/courseService";
import { submitQuiz } from "../services/quizService";
import { getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { markCourseEnrolled } = useAuth();

  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCourseById(courseId);
        setCourse(response.course);
        setAnswers(new Array(response.course?.quiz?.length || 0).fill(""));
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Unable to load the quiz."));
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((current) => {
      const nextAnswers = [...current];
      nextAnswers[questionIndex] = selectedOption;
      return nextAnswers;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!course?.quiz?.length) {
      setError("This course does not have a quiz to submit.");
      return;
    }

    if (answers.some((answer) => !answer)) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitQuiz({
        courseId,
        answers
      });

      markCourseEnrolled(courseId);

      sessionStorage.setItem(
        "latestQuizAttempt",
        JSON.stringify({
          courseId,
          courseTitle: course.title,
          result: response.result,
          certificate: response.certificate
        })
      );

      navigate(`/result/${courseId}`, {
        state: {
          courseTitle: course.title,
          result: response.result,
          certificate: response.certificate
        }
      });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Could not submit your quiz."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="page-section">
        <LoadingSpinner label="Preparing quiz..." />
      </section>
    );
  }

  if (error && !course) {
    return (
      <section className="page-section">
        <AlertMessage message={error} />
      </section>
    );
  }

  if (!course || !course.quiz?.length) {
    return (
      <section className="page-section">
        <EmptyState
          title="Quiz unavailable"
          description="This course does not have quiz questions yet."
        />
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="split-header">
          <div className="page-title">
            <span className="pill">Quiz session</span>
            <h1>{course.title}</h1>
            <p>
              Choose one answer for each question. The backend calculates your score and pass
              status when you submit.
            </p>
          </div>
          <div className="hero-stat">
            <strong>{course.quiz.length}</strong>
            <span>Total questions</span>
          </div>
        </div>

        <AlertMessage message={error} />

        <form className="stack" onSubmit={handleSubmit}>
          {course.quiz.map((question, questionIndex) => (
            <div className="question-card" key={`${question.question}-${questionIndex}`}>
              <div className="question-card__head">
                <div className="question-card__number">{questionIndex + 1}</div>
                <div>
                  <strong>{question.question}</strong>
                  <p className="muted">Select the best answer from the options below.</p>
                </div>
              </div>

              <div className="option-list">
                {question.options.map((option, optionIndex) => (
                  <label className="option-card" key={`${option}-${optionIndex}`}>
                    <input
                      checked={answers[questionIndex] === option}
                      name={`question-${questionIndex}`}
                      onChange={() => handleAnswerChange(questionIndex, option)}
                      type="radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="button button--primary" disabled={submitting} type="submit">
            {submitting ? "Submitting quiz..." : "Submit Quiz"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default QuizPage;
