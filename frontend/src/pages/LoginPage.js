import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await login(formData);
      const fallbackPath = response.user.role === "admin" ? "/admin" : "/dashboard";
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to log in."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section auth-shell">
      <div className="auth-card">
        <div className="auth-card__heading">
          <span className="pill">Welcome back</span>
          <h1>Log in to continue learning</h1>
          <p>Access your dashboard, quiz attempts, and certificates.</p>
        </div>

        <AlertMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="button button--primary button--full" disabled={submitting} type="submit">
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: "1rem" }}>
          <span className="muted">Need an account?</span>
          <Link className="button button--ghost" to="/register">
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
