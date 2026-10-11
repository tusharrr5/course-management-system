import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CourseForm from '../components/CourseForm';
import '../admin.css';

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

  // Delete confirmation modal states
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // User feedback message state (success / error notifications)
  const [feedback, setFeedback] = useState(null);

  // Auto-dismiss success feedback banners after 4 seconds
  useEffect(() => {
    if (feedback && feedback.type === 'success') {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Helper to build auth headers
  const getAuthHeaders = useCallback(() => {
    const activeToken = token || localStorage.getItem('token');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  // Manual fetch function for retries or post-mutation sync
  const fetchCourses = useCallback((showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setIsLoading(true);
    }
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
        if (showLoadingSpinner) {
          setIsLoading(false);
        }
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

          // Update local state dynamically without full page reload
          setCourses((prev) =>
            prev.map((c) => ((c._id || c.id) === courseId ? { ...c, ...updatedCourse } : c))
          );

          setFeedback({
            type: 'success',
            message:
              res.data?.message ||
              `Course "${updatedCourse.title || courseData.title}" updated successfully!`,
          });

          setIsModalOpen(false);
          setEditingCourse(null);

          // Re-fetch courses in background to ensure database sync
          fetchCourses(false);
        } catch (apiErr) {
          // Keep modal open and report API error without losing form data
          const message =
            apiErr.response?.data?.message ||
            (apiErr.response?.status === 401
              ? 'Session expired. Please log in again.'
              : apiErr.response?.status === 403
              ? 'Admin privileges required to update courses.'
              : apiErr.response?.status === 400
              ? 'Validation error: Please ensure all fields are correct.'
              : 'Failed to update course on the backend.');
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
          }

          setFeedback({
            type: 'success',
            message:
              res.data?.message || `Course "${courseData.title}" added successfully!`,
          });

          setIsModalOpen(false);
          setEditingCourse(null);

          // Re-fetch courses in background to ensure database sync
          fetchCourses(false);
        } catch (apiErr) {
          // Keep modal open and report API error without losing form data
          const message =
            apiErr.response?.data?.message ||
            (apiErr.response?.status === 401
              ? 'Session expired. Please log in again.'
              : apiErr.response?.status === 403
              ? 'Admin privileges required to create courses.'
              : apiErr.response?.status === 400
              ? 'Validation error: Please ensure all fields are correct.'
              : 'Failed to create course on the backend.');
          setFormServerError(message);
        }
      }
    } catch {
      setFormServerError('An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation modal to prevent accidental deletion
  const handleOpenDeleteModal = (course) => {
    setDeleteError('');
    setCourseToDelete({
      id: course._id || course.id,
      title: course.title,
    });
  };

  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setCourseToDelete(null);
      setDeleteError('');
    }
  };

  // Execute delete action connected to real backend DELETE endpoint
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await axios.delete(`${API_BASE_URL}/courses/${courseToDelete.id}`, {
        headers: getAuthHeaders(),
      });

      const successMessage =
        res.data?.message || `Course "${courseToDelete.title}" deleted successfully!`;

      // Update state dynamically without full page reload
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== courseToDelete.id));

      setFeedback({
        type: 'success',
        message: successMessage,
      });

      setCourseToDelete(null);

      // Re-fetch courses in background to ensure database sync
      fetchCourses(false);
    } catch (apiErr) {
      const message =
        apiErr.response?.data?.message ||
        (apiErr.response?.status === 401
          ? 'Session expired. Please log in again.'
          : apiErr.response?.status === 403
          ? 'Admin privileges required to delete courses.'
          : 'Failed to delete course on the server.');
      setDeleteError(message);
      setFeedback({ type: 'error', message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header section */}
      <header className="admin-header dashboard-header">
        <div className="admin-header-info header-info">
          <h1>Admin Dashboard</h1>
          <p className="admin-header-description dashboard-description">
            Manage course catalog, update curriculum details, and track offerings.
          </p>
        </div>
        <div className="admin-header-actions header-actions">
          <button
            type="button"
            className="btn btn-primary btn-add-course"
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
                            onClick={() => handleOpenDeleteModal(course)}
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

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div
            className="modal-container delete-modal delete-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="delete-modal-header">
              <span className="delete-warning-icon" aria-hidden="true">
                ⚠️
              </span>
              <h3 id="delete-dialog-title">Delete Course Confirmation</h3>
            </div>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>&ldquo;{courseToDelete.title}&rdquo;</strong>?
            </p>
            <p className="delete-modal-subtext">
              This action cannot be undone and will permanently remove this course from the database and public catalog.
            </p>

            {deleteError && (
              <div className="form-server-error" role="alert">
                {deleteError}
              </div>
            )}

            <div className="form-actions delete-modal-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}

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
