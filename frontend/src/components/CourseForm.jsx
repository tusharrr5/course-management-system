import { useState } from 'react';
/**
 * CourseForm Component
 * A reusable controlled form supporting both Add and Edit modes.
 *
 * Props:
 * - initialCourse: null for Add mode, or an existing course object for Edit mode
 * - onSubmit: function called with validated course data
 * - onCancel: function called when Cancel button is clicked
 * - isSubmitting: boolean indicating if an API call is in progress
 * - serverError: optional string with an error message from the backend
 */
function CourseForm({ initialCourse, onSubmit, onCancel, isSubmitting = false, serverError = '' }) {
  // Check if we are editing an existing course (supports MongoDB _id or id)
  const isEditMode = Boolean(initialCourse && (initialCourse._id !== undefined || initialCourse.id !== undefined));

  // Controlled form state for all five required fields
  const [title, setTitle] = useState(initialCourse ? initialCourse.title || '' : '');
  const [description, setDescription] = useState(initialCourse ? initialCourse.description || '' : '');
  const [instructor, setInstructor] = useState(initialCourse ? initialCourse.instructor || '' : '');
  const [duration, setDuration] = useState(initialCourse ? initialCourse.duration || '' : '');
  const [price, setPrice] = useState(
    initialCourse && initialCourse.price !== undefined ? initialCourse.price : ''
  );

  // Client-side validation errors state
  const [errors, setErrors] = useState({});

  // Helper to clear a field error when user types
  const handleFieldChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: '',
      }));
    }
  };

  // Validate all 5 required fields according to rules
  const validateForm = () => {
    const newErrors = {};

    if (!title || title.trim() === '') {
      newErrors.title = 'Title is required and cannot be empty.';
    }

    if (!description || description.trim() === '') {
      newErrors.description = 'Description is required and cannot be empty.';
    }

    if (!instructor || instructor.trim() === '') {
      newErrors.instructor = 'Instructor is required and cannot be empty.';
    }

    if (!duration || duration.trim() === '') {
      newErrors.duration = 'Duration is required (e.g. 4 Weeks).';
    }

    const numericPrice = Number(price);
    if (price === '' || price === null || price === undefined) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(numericPrice)) {
      newErrors.price = 'Price must be a valid number.';
    } else if (numericPrice <= 0) {
      newErrors.price = 'Price must be greater than zero.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear local validation errors
    setErrors({});

    // Submit validated course data with price converted to a number
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      duration: duration.trim(),
      price: Number(price),
    });
  };

  return (
    <form className="course-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h3>{isEditMode ? 'Edit Course' : 'Add New Course'}</h3>
        <p className="form-subtitle">
          {isEditMode
            ? 'Update the details for this course.'
            : 'Fill in the details below to create a new course.'}
        </p>
      </div>

      {serverError && (
        <div className="form-server-error" role="alert">
          {serverError}
        </div>
      )}

      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="course-title">
          Title <span className="required-star">*</span>
        </label>
        <input
          id="course-title"
          name="title"
          type="text"
          className={errors.title ? 'input-error' : ''}
          placeholder="e.g. Introduction to React"
          value={title}
          onChange={handleFieldChange(setTitle, 'title')}
          disabled={isSubmitting}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="course-description">
          Description <span className="required-star">*</span>
        </label>
        <textarea
          id="course-description"
          name="description"
          rows="4"
          className={errors.description ? 'input-error' : ''}
          placeholder="Provide a detailed summary of what students will learn..."
          value={description}
          onChange={handleFieldChange(setDescription, 'description')}
          disabled={isSubmitting}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      {/* Instructor Field */}
      <div className="form-group">
        <label htmlFor="course-instructor">
          Instructor <span className="required-star">*</span>
        </label>
        <input
          id="course-instructor"
          name="instructor"
          type="text"
          className={errors.instructor ? 'input-error' : ''}
          placeholder="e.g. Dr. Angela Yu"
          value={instructor}
          onChange={handleFieldChange(setInstructor, 'instructor')}
          disabled={isSubmitting}
        />
        {errors.instructor && <span className="error-message">{errors.instructor}</span>}
      </div>

      {/* Duration Field */}
      <div className="form-group">
        <label htmlFor="course-duration">
          Duration <span className="required-star">*</span>
        </label>
        <input
          id="course-duration"
          name="duration"
          type="text"
          className={errors.duration ? 'input-error' : ''}
          placeholder="e.g. 4 Weeks"
          value={duration}
          onChange={handleFieldChange(setDuration, 'duration')}
          disabled={isSubmitting}
        />
        {errors.duration && <span className="error-message">{errors.duration}</span>}
      </div>

      {/* Price Field */}
      <div className="form-group">
        <label htmlFor="course-price">
          Price (₹ / $) <span className="required-star">*</span>
        </label>
        <input
          id="course-price"
          name="price"
          type="number"
          step="any"
          className={errors.price ? 'input-error' : ''}
          placeholder="e.g. 499"
          value={price}
          onChange={handleFieldChange(setPrice, 'price')}
          disabled={isSubmitting}
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Course' : 'Add Course'}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;
