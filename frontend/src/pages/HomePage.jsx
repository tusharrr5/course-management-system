import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import '../home.css';

/**
 * HomePage Component
 * Welcoming landing page introducing the Course Management System,
 * with a quick link to browse the full catalog and featured course highlights.
 */
export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { API_BASE_URL } = useAuth();

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/courses`)
      .then((response) => {
        if (!isMounted) return;

        let courseList = [];
        if (response.data && Array.isArray(response.data.courses)) {
          courseList = response.data.courses;
        } else if (Array.isArray(response.data)) {
          courseList = response.data;
        }

        // Display up to 3 featured courses from the existing database
        setFeaturedCourses(courseList.slice(0, 3));
        setError('');
      })
      .catch((err) => {
        if (!isMounted) return;
        const errorMsg =
          err.response?.data?.message || err.message || 'Unable to connect to the backend server.';
        console.warn('Backend unavailable on HomePage:', errorMsg);
        setError(errorMsg);
        setFeaturedCourses([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, refreshTrigger]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="home-container">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <span className="hero-tag">🎓 College Learning Portal</span>
        <h1 className="hero-title">Welcome to Course Management System</h1>
        <p className="hero-description">
          Explore structured computer science courses and practical curriculum modules.
          <br />
          Browse available course offerings, review outlines, and track your learning journey.
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-primary btn-hero">
            Browse Courses &rarr;
          </Link>
        </div>
      </section>

      {/* Educational Platform Highlights */}
      <section className="highlights-section">
        <div className="highlight-card">
          <span className="highlight-icon">💻</span>
          <h3 className="highlight-title">Practical Curriculum</h3>
          <p className="highlight-text">
            Learn with project-based course modules focused on real-world development workflows.
          </p>
        </div>
        <div className="highlight-card">
          <span className="highlight-icon">📖</span>
          <h3 className="highlight-title">Course Outlines</h3>
          <p className="highlight-text">
            Review detailed course descriptions, expected durations, and tuition fees before enrolling.
          </p>
        </div>
        <div className="highlight-card">
          <span className="highlight-icon">⏱️</span>
          <h3 className="highlight-title">Flexible Learning</h3>
          <p className="highlight-text">
            Structured week-by-week timelines designed to balance coursework and practical coding.
          </p>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="featured-section">
        <div className="featured-header">
          <div>
            <h2 className="featured-title">Featured Courses</h2>
            <p className="featured-subtitle">
              A preview of the first courses available in our catalog.
            </p>
          </div>
          <Link to="/courses" className="view-all-link">
            View All Courses &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="home-loading-state">
            <div className="spinner"></div>
            <p>Loading featured courses...</p>
          </div>
        ) : error ? (
          <div className="home-error-state" role="alert">
            <span className="error-icon">⚠️</span>
            <h3>Unable to Load Featured Courses</h3>
            <p>
              Could not connect to the backend server ({error}). Please make sure the API server is running.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn btn-primary btn-sm"
            >
              🔄 Retry Connection
            </button>
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="featured-grid">
            {featuredCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="courses-empty-state">
            <span className="empty-icon">📚</span>
            <h3>No Courses Available Yet</h3>
            <p>Courses will appear here once added to the catalog.</p>
          </div>
        )}
      </section>
    </div>
  );
}
