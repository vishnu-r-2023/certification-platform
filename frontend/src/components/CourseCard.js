import { Link } from "react-router-dom";

function CourseCard({ course, actionLabel = "View Course", footerContent }) {
  return (
    <article className="course-card">
      <div className="course-card__top">
        <span className="pill">{course.lessons?.length || 0} lessons</span>
        <span className="pill pill--soft">{course.quiz?.length || 0} quiz questions</span>
      </div>

      <h3>{course.title}</h3>
      <p>{course.description}</p>

      <div className="course-card__footer">
        {footerContent || (
          <Link className="button button--primary" to={`/courses/${course._id}`}>
            {actionLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

export default CourseCard;
