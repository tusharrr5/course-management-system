import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import '../courses.css';

/**
 * Sample courses used for visual testing only when backend is unreachable.
 * Clearly labeled in the UI as fallback/sample preview data.
 */
const SAMPLE_COURSES = [
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
  },
  {
    _id: 'sample-4',
    title: 'Cloud Computing & DevOps Fundamentals',
    description: 'Hands-on practice with Docker, Kubernetes, CI/CD pipelines, container orchestration, and cloud deployment architectures.',
    instructor: 'Stephane Maarek',
    duration: '6 Weeks',
    price: 3999
  }
];

/**
 * CoursesPage Component
 * Fetches and displays available courses in a responsive card grid with real-time search.
 * Handles loading, errors, empty states, and fallback sample data.
 */
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { API_BASE_URL } = useAuth();

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/courses`)
      .then((response) => {
        if (!isMounted) return;

        // Backend returns { success: true, courses: [...] }
        if (response.data && Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
        } else if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          setCourses([]);
        }
        setError('');
        setIsUsingSampleData(false);
      })
      .catch((err) => {
        if (!isMounted) return;

        const errorMsg =
          err.response?.data?.message || err.message || 'Unable to connect to the backend server.';
        
        console.warn('Backend unavailable, using sample data for visual testing:', errorMsg);
        setError(errorMsg);
        // Fallback to sample data for visual testing when backend is offline
        setCourses(SAMPLE_COURSES);
        setIsUsingSampleData(true);
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

  // Frontend real-time filtering by course title and instructor
  const trimmedSearch = searchTerm.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => {
    if (!trimmedSearch) return true;
    const title = (course.title || '').toLowerCase();
    const instructor = (course.instructor || '').toLowerCase();
    return title.includes(trimmedSearch) || instructor.includes(trimmedSearch);
  });

  // Price sorting: ascending, descending, or default
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sortBy === 'price-desc') {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    return 0;
  });

  return (
    <div className="courses-page-container">
      {/* Header section */}
      <div className="courses-header">
        <h1 className="courses-heading">Available Courses</h1>
        <p className="courses-subheading">
          Explore our collection of industry-focused courses and advance your career today.
        </p>
      </div>

      {/* Visual Testing / Backend Offline Notice */}
      {isUsingSampleData && (
        <div className="courses-alert-banner" role="alert">
          <span className="banner-icon">⚠️</span>
          <div className="banner-content">
            <strong>Visual Testing Mode: Sample Data Displayed</strong>
            <p>
              Backend API at <code>{API_BASE_URL}/courses</code> is offline or unreachable ({error}).
              Showing clearly labeled sample data for visual UI review.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-outline btn-sm retry-btn"
          >
            🔄 Retry Connection
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="courses-loading-state">
          <div className="spinner"></div>
          <p>Loading course catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        /* Empty course list state (database has no courses) */
        <div className="courses-empty-state">
          <span className="empty-icon">📚</span>
          <h3>No Courses Found</h3>
          <p>There are currently no courses available in the catalog. Please check back later.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-primary btn-sm"
          >
            Refresh Catalog
          </button>
        </div>
      ) : (
        <>
          {/* Search and Sort section */}
          <div className="courses-search-section">
            <div className="courses-controls-row">
              <div className="courses-search-wrapper">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="courses-sort-wrapper">
                <label htmlFor="sort-select" className="sort-label">Sort by Price:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort courses by price"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            <p className="courses-count">
              Showing {sortedCourses.length} of {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </p>
          </div>

          {/* If search query has no matches, show specific no-match message */}
          {sortedCourses.length === 0 ? (
            <div className="courses-no-results">
              <span className="empty-icon">🔍</span>
              <h3>No courses match your search</h3>
              <p>Try searching with a different course title or instructor name.</p>
            </div>
          ) : (
            /* Responsive Courses Grid */
            <div className="courses-grid">
              {sortedCourses.map((course) => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
