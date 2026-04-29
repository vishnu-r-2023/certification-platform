import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../services/api";

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  registerAsAdmin: false,
  adminSecret: ""
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.registerAsAdmin ? "admin" : "user"
      };

      if (formData.registerAsAdmin) {
        payload.adminSecret = formData.adminSecret;
      }

      const response = await register(payload);
      navigate(response.user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Unable to create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section auth-shell">
      <div className="auth-card">
        <div className="auth-card__heading">
          <span className="pill">Create an account</span>
          <h1>Join SkillForge</h1>
          <p>Register as a learner or use the admin secret for administrator access.</p>
        </div>

        <AlertMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat the password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="registerAsAdmin" style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
              <input
                id="registerAsAdmin"
                name="registerAsAdmin"
                type="checkbox"
                checked={formData.registerAsAdmin}
                onChange={handleChange}
              />
              Register as admin
            </label>
            <span className="helper-text">Keep this unchecked for a normal learner account.</span>
          </div>

          {formData.registerAsAdmin ? (
            <div className="field-group">
              <label htmlFor="adminSecret">Admin registration secret</label>
              <input
                id="adminSecret"
                name="adminSecret"
                type="password"
                placeholder="Enter the admin secret"
                value={formData.adminSecret}
                onChange={handleChange}
                required
              />
            </div>
          ) : null}

          <button className="button button--primary button--full" disabled={submitting} type="submit">
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: "1rem" }}>
          <span className="muted">Already have an account?</span>
          <Link className="button button--ghost" to="/login">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
