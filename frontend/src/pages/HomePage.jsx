import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import '../home.css';

/**
 * Fallback preview courses used only when backend server is offline.
 */
const FALLBACK_FEATURED = [
  {
    _id: 'sample-1',
    title: 'Full-Stack Web Development with MERN',
    description: 'Learn MongoDB, Express, React, and Node.js from scratch to build modern full-stack web applications with authentication and REST APIs.',
    instructor: 'Dr. Angela Yu',
    duration: '12 Weeks',
    price: 4999
  },
  {
    _id: 'sample-2',
    title: 'Data Structures & Algorithms Mastery',
    description: 'Comprehensive guide to mastering problem solving, trees, graphs, dynamic programming, and recursion in modern programming languages.',
    instructor: 'Prof. Abdul Bari',
    duration: '10 Weeks',
    price: 3499
  },
  {
    _id: 'sample-3',
    title: 'Python for Data Science & Machine Learning',
    description: 'Master NumPy, Pandas, Matplotlib, Scikit-Learn, and build real-world machine learning predictive models and neural networks.',
    instructor: 'Jose Portilla',
    duration: '8 Weeks',
    price: 2999
  }
];

/**
 * HomePage Component
 * Welcoming landing page introducing the Course Management System,
 * with a quick link to browse the full catalog and featured course highlights.
 */
export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Backend unavailable on HomePage, showing fallback preview courses:', err.message);
        setFeaturedCourses(FALLBACK_FEATURED);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  return (
    <div className="home-container">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <span className="hero-tag">🎓 College Learning Portal</span>
        <h1 className="hero-title">Welcome to Course Management System</h1>
        <p className="hero-description">
          Explore industry-focused computer science courses taught by experienced mentors.
          <br />
          Build hands-on projects, master modern technologies, and accelerate your career.
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-primary btn-hero">
            Browse Courses &rarr;
          </Link>
        </div>
      </section>

      {/* Educational Platform Highlights (No invented statistics) */}
      <section className="highlights-section">
        <div className="highlight-card">
          <span className="highlight-icon">💻</span>
          <h3 className="highlight-title">Practical Curriculum</h3>
          <p className="highlight-text">
            Learn with project-based course modules focused on real-world development workflows.
          </p>
        </div>
        <div className="highlight-card">
          <span className="highlight-icon">👨‍🏫</span>
          <h3 className="highlight-title">Expert Instructors</h3>
          <p className="highlight-text">
            Gain insights and mentorship from qualified educators committed to student growth.
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
              Hand-picked courses from our catalog to get you started.
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
