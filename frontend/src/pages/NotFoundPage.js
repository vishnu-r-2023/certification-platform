import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

function NotFoundPage() {
  return (
    <section className="page-section">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
        action={
          <Link className="button button--primary" to="/">
            Return Home
          </Link>
        }
      />
    </section>
  );
}

export default NotFoundPage;
