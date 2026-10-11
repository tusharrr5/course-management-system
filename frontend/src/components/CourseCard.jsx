import { Link } from 'react-router-dom';

/**
 * CourseCard Component
 * Displays summary information for a single course in a structured card.
 * 
 * Props:
 *   - course: Object containing { _id, title, description, instructor, duration, price }
 */
export default function CourseCard({ course }) {
  if (!course) return null;

  const {
    _id,
    id,
    title,
    description,
    instructor,
    duration,
    price
  } = course;

  const courseId = _id || id || '';

  return (
    <div className="course-card">
      <div className="course-card-header">
        <span className="course-category-tag">Course</span>
        <span className="course-duration-badge">⏱️ {duration || 'Self-paced'}</span>
      </div>

      <div className="course-card-body">
        <h3 className="course-title">{title}</h3>
        <p className="course-description">{description}</p>
        
        <div className="course-meta">
          <div className="course-instructor">
            <span className="instructor-icon">👨‍🏫</span>
            <span className="instructor-text">
              Instructor: <strong>{instructor || 'Instructor'}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="course-card-footer">
        <div className="course-price-container">
          <span className="course-price-label">Tuition Fee</span>
          <span className="course-price-value">
            ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
          </span>
        </div>

        <Link
          to={`/courses/${courseId}`}
          className="btn btn-primary btn-sm view-details-link"
          aria-label={`View details for ${title}`}
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
