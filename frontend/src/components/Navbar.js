import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand-mark" to="/">
          <span className="brand-mark__badge">SF</span>
          <span>
            SkillForge
            <small>Online Skill Certification Platform</small>
          </span>
        </Link>

        <nav className="site-nav">
          <NavLink to="/">Courses</NavLink>
          {isAuthenticated && !isAdmin ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
          {isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                <strong>{user?.name}</strong>
                <span>{isAdmin ? "Administrator" : "Learner"}</span>
              </div>
              <button className="button button--ghost" onClick={handleLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="button button--ghost" to="/login">
                Login
              </Link>
              <Link className="button button--primary" to="/register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
