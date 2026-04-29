import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { getCertificateByCourse } from "../services/certificateService";
import { getApiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificate = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCertificateByCourse(courseId);
        setCertificate(response.certificate);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, "Unable to fetch certificate."));
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [courseId]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <section className="page-section">
        <LoadingSpinner label="Loading certificate..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <div className="content-card">
          <AlertMessage message={error} />
          <Link className="button button--ghost" to={`/courses/${courseId}`}>
            Return to Course
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="certificate-card">
        <div className="certificate-surface">
          <span className="pill">Official course certificate</span>
          <h1>Certificate of Achievement</h1>
          <p>
            This certifies that <span className="certificate-name">{user?.name}</span> has
            successfully passed the assessment for the course{" "}
            <strong>{certificate.courseTitle}</strong>.
          </p>

          <div className="certificate-meta">
            <div>
              <strong>Course</strong>
              <p>{certificate.courseTitle}</p>
            </div>
            <div>
              <strong>Issued At</strong>
              <p>{new Date(certificate.issuedAt).toLocaleString()}</p>
            </div>
            <div>
              <strong>Certificate ID</strong>
              <p>{certificate.id}</p>
            </div>
          </div>
        </div>

        <div className="content-card" style={{ margin: "1rem" }}>
          <p>
            The backend returns certificate metadata as JSON, so this page renders a printable
            certificate view and lets learners save it as PDF using the browser print dialog.
          </p>

          <div className="result-actions">
            <button className="button button--primary" onClick={handleDownload} type="button">
              Download / Print Certificate
            </button>
            <span className="muted">API URL: {certificate.certificateUrl}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertificatePage;
