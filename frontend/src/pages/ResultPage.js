import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";

function ResultPage() {
  const { courseId } = useParams();
  const location = useLocation();

  const [attempt, setAttempt] = useState(() => {
    if (location.state?.result) {
      return location.state;
    }

    try {
      const storedAttempt = sessionStorage.getItem("latestQuizAttempt");

      if (!storedAttempt) {
        return null;
      }

      const parsedAttempt = JSON.parse(storedAttempt);
      return parsedAttempt.courseId === courseId ? parsedAttempt : null;
    } catch (_error) {
      return null;
    }
  });

  useEffect(() => {
    if (location.state?.result) {
      setAttempt(location.state);
    }
  }, [location.state]);

  if (!attempt?.result) {
    return (
      <section className="page-section">
        <EmptyState
          title="No quiz result available"
          description="Take the quiz first to see your score and certificate status."
          action={
            <Link className="button button--primary" to={`/courses/${courseId}`}>
              Back to Course
            </Link>
          }
        />
      </section>
    );
  }

  const { result, certificate, courseTitle } = attempt;

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-title">
          <span className={`pill ${result.passed ? "" : "pill--soft"}`}>
            {result.passed ? "Passed" : "Needs improvement"}
          </span>
          <h1>{courseTitle || "Quiz Result"}</h1>
          <p>
            This screen reflects the exact result returned by `POST /api/quiz/submit`,
            including score, correct answers, and the pass threshold.
          </p>
        </div>

        <div className="stats-grid">
          <div className={`metric ${result.passed ? "metric--success" : "metric--danger"}`}>
            <span>Score</span>
            <strong>{result.score}%</strong>
          </div>
          <div className="metric">
            <span>Correct answers</span>
            <strong>
              {result.correctAnswersCount}/{result.totalQuestions}
            </strong>
          </div>
          <div className="metric">
            <span>Pass mark</span>
            <strong>{result.passMark}%</strong>
          </div>
        </div>

        <div className="result-actions" style={{ marginTop: "1.25rem" }}>
          <Link className="button button--secondary" to={`/quiz/${courseId}`}>
            Retake Quiz
          </Link>
          <Link className="button button--ghost" to={`/courses/${courseId}`}>
            Review Course
          </Link>
          {certificate ? (
            <Link className="button button--primary" to={`/certificate/${courseId}`}>
              View Certificate
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ResultPage;
