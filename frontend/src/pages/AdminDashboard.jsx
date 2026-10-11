import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CourseForm from '../components/CourseForm';

/**
 * AdminDashboard Component
 * Central admin interface for managing course catalog, viewing stats, and performing CRUD operations.
 * Connected directly to backend API with JWT Authorization and MongoDB _id handling.
 */
function AdminDashboard() {
  const { token, API_BASE_URL: authApiUrl } = useAuth();
  const API_BASE_URL = authApiUrl || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Course data state (initialized empty — connects to actual database)
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal & form management states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formServerError, setFormServerError] = useState('');

  // User feedback message state (success / error notifications)
  const [feedback, setFeedback] = useState(null);

  // Helper to build auth headers
  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Manual fetch function for retries or post-mutation sync
  const fetchCourses = useCallback(() => {
    setIsLoading(true);
    setFetchError('');
    return axios
      .get(`${API_BASE_URL}/courses`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.courses)) {
          setCourses(res.data.courses);
        } else if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
      })
      .catch((err) => {
        const message =
          err.response?.data?.message || 'Failed to load courses from backend server.';
        setFetchError(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [API_BASE_URL, getAuthHeaders]);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_BASE_URL}/courses`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.courses)) {
          setCourses(res.data.courses);
        } else if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else {
          setCourses([]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const message =
          err.response?.data?.message || 'Failed to load courses from backend server.';
        setFetchError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, getAuthHeaders]);

  // Summary statistics calculated from current live courses
  const totalCourses = courses.length;
  const uniqueInstructors = new Set(
    courses.map((c) => (c.instructor ? c.instructor.trim() : '')).filter(Boolean)
  ).size;
  const averagePrice =
    totalCourses > 0
      ? (courses.reduce((sum, c) => sum + Number(c.price || 0), 0) / totalCourses).toFixed(2)
      : '0.00';

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormServerError('');
    setIsModalOpen(true);
  };

  // Open modal in Edit mode with selected course data
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormServerError('');
    setIsModalOpen(true);
  };

  // Close modal and reset active form target
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormServerError('');
  };

  // Handle course form submission (both Add and Edit) via real backend endpoints
  const handleSaveCourse = async (courseData) => {
    setIsSubmitting(true);
    setFormServerError('');

    try {
      if (editingCourse) {
        // ==========================================
        // UPDATE EXISTING COURSE (PUT /api/courses/:id)
        // ==========================================
        const courseId = editingCourse._id || editingCourse.id;

        try {
          const res = await axios.put(
            `${API_BASE_URL}/courses/${courseId}`,
            courseData,
            { headers: getAuthHeaders() }
          );

          const updatedCourse = res.data?.course || res.data || {
            ...editingCourse,
            ...courseData,
          };

          // Update local state with modified course
          setCourses((prev) =>
            prev.map((c) => ((c._id || c.id) === courseId ? { ...c, ...updatedCourse } : c))
          );

          setFeedback({
            type: 'success',
            message: `Course "${updatedCourse.title || courseData.title}" updated successfully!`,
          });

          setIsModalOpen(false);
          setEditingCourse(null);
        } catch (apiErr) {
          // Keep modal open and report API error without losing form data
          const message =
            apiErr.response?.data?.message || 'Failed to update course on the backend.';
          setFormServerError(message);
        }
      } else {
        // ==========================================
        // CREATE NEW COURSE (POST /api/courses)
        // ==========================================
        try {
          const res = await axios.post(
            `${API_BASE_URL}/courses`,
            courseData,
            { headers: getAuthHeaders() }
          );

          const newCourse = res.data?.course || res.data;

          if (newCourse) {
            setCourses((prev) => [newCourse, ...prev]);
          } else {
            // Refetch to sync state with database
            await fetchCourses();
          }

          setFeedback({
            type: 'success',
            message: `Course "${courseData.title}" added successfully!`,
          });

          setIsModalOpen(false);
          setEditingCourse(null);
        } catch (apiErr) {
          // Keep modal open and report API error without losing form data
          const message =
            apiErr.response?.data?.message || 'Failed to create course on the backend.';
          setFormServerError(message);
        }
      }
    } catch {
      setFormServerError('An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete course action connected to real backend DELETE endpoint
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${courseTitle}"?`);
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(),
      });

      // Update state only on successful deletion
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== courseId));
      setFeedback({
        type: 'success',
        message: `Course "${courseTitle}" deleted successfully!`,
      });
    } catch (apiErr) {
      const message =
        apiErr.response?.data?.message || 'Failed to delete course on the server.';
      setFeedback({ type: 'error', message });
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header section */}
      <header className="dashboard-header">
        <div className="header-info">
          <h1>Admin Course Management</h1>
          <p className="dashboard-description">
            Manage course catalog, update curriculum details, and track offerings.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            + Add New Course
          </button>
        </div>
      </header>

      {/* Backend API Integration Notice */}
      <div className="api-status-banner">
        <span
          className="status-indicator-dot"
          style={{
            backgroundColor: isLoading
              ? '#f59e0b'
              : fetchError
              ? '#ef4444'
              : '#10b981',
          }}
        ></span>
        <span>
          Backend Status:{' '}
          <strong>
            {isLoading
              ? 'Connecting to backend...'
              : fetchError
              ? `Connection Issue: ${fetchError}`
              : `Connected (Live API at ${API_BASE_URL})`}
          </strong>
        </span>
      </div>

      {/* Action Feedback Banner (Success / Error) */}
      {feedback && (
        <div className={`feedback-banner feedback-${feedback.type}`} role="alert">
          <span>{feedback.message}</span>
          <button
            type="button"
            className="feedback-dismiss-btn"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss feedback"
          >
            &times;
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <section className="summary-cards-container" aria-label="Course summary statistics">
        <div className="summary-card">
          <span className="card-label">Total Courses</span>
          <span className="card-value">{totalCourses}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Active Instructors</span>
          <span className="card-value">{uniqueInstructors}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Average Price</span>
          <span className="card-value">₹{averagePrice}</span>
        </div>
      </section>

      {/* Courses Table / Empty State / Loading State */}
      <section className="courses-section" aria-label="Course list">
        {isLoading ? (
          <div className="auth-loading-state">
            <div className="spinner"></div>
            <p>Loading course catalog from database...</p>
          </div>
        ) : fetchError && courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>Unable to load courses</h3>
            <p>{fetchError}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchCourses}
              style={{ marginTop: '12px' }}
            >
              Retry Connection
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses found</h3>
            <p>Your course catalog is currently empty. Click below to add your first course.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              Add New Course
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const courseId = course._id || course.id;
                  return (
                    <tr key={courseId}>
                      <td className="col-title">
                        <div className="course-title-cell">
                          <strong className="course-title-text">{course.title}</strong>
                          {course.description && (
                            <p className="course-description-preview">{course.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="col-instructor">{course.instructor}</td>
                      <td className="col-duration">
                        <span className="duration-badge">{course.duration}</span>
                      </td>
                      <td className="col-price">₹{course.price}</td>
                      <td className="col-actions">
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn btn-edit"
                            onClick={() => handleOpenEditModal(course)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-delete"
                            onClick={() => handleDeleteCourse(courseId, course.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal / Panel for Adding & Editing Courses */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close dialog"
            >
              &times;
            </button>

            {/* CourseForm component manages controlled inputs and validation */}
            <CourseForm
              key={editingCourse ? `edit-${editingCourse._id || editingCourse.id}` : 'add-new'}
              initialCourse={editingCourse}
              onSubmit={handleSaveCourse}
              onCancel={handleCloseModal}
              isSubmitting={isSubmitting}
              serverError={formServerError}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
