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

  const issuedDate = certificate?.issuedAt
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(certificate.issuedAt))
    : "";

  const learnerName = user?.name || "Learner";

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
    <section className="page-section certificate-page">
      <div className="content-card certificate-toolbar no-print">
        <div className="page-title">
          <span className="pill">Official course certificate</span>
          <h1>Your certificate is ready</h1>
          <p>Review the layout below, then print it or save it as a PDF for later.</p>
        </div>

        <div className="result-actions">
          <Link className="button button--ghost" to={`/courses/${courseId}`}>
            Return to Course
          </Link>
          <button className="button button--primary" onClick={handleDownload} type="button">
            Download / Print Certificate
          </button>
        </div>
      </div>

      <div className="certificate-card">
        <article className="certificate-surface" aria-label="Printable certificate">
          <div className="certificate-frame">
            <div className="certificate-header">
              <div>
                <span className="certificate-label">SkillForge</span>
                <p className="certificate-subtitle">Online Skill Certification Platform</p>
              </div>
              <div className="certificate-seal" aria-hidden="true">
                <span>SF</span>
              </div>
            </div>

            <div className="certificate-body">
              <p className="certificate-kicker">Certificate of Achievement</p>
              <h1>Certificate of Achievement</h1>
              <p className="certificate-copy">This certificate is proudly presented to</p>
              <p className="certificate-name">{learnerName}</p>
              <p className="certificate-copy">
                for successfully completing the course and meeting the assessment requirements
                for
              </p>
              <h2 className="certificate-course">{certificate.courseTitle}</h2>
              <p className="certificate-copy">
                Awarded on <strong>{issuedDate}</strong> in recognition of demonstrated learning
                and course completion.
              </p>
            </div>

            <div className="certificate-footer">
              <div className="certificate-signature">
                <span className="certificate-signature__line" />
                <strong>SkillForge Academy</strong>
                <span>Issuing authority</span>
              </div>

              <div className="certificate-meta">
                <div>
                  <span>Issued on</span>
                  <strong>{issuedDate}</strong>
                </div>
                <div>
                  <span>Certificate ID</span>
                  <strong>{certificate.id}</strong>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="content-card certificate-note no-print">
        <p>
          Tip: choose your browser&apos;s <strong>Save as PDF</strong> destination if you want a
          digital copy. The raw backend API URL is intentionally hidden from this learner-facing
          view.
        </p>
      </div>
    </section>
  );
}

export default CertificatePage;
