/**
 * Extracts a human-readable error message from a backend response.
 * Handles FastAPI/Pydantic validation errors (arrays of objects) 
 * as well as standard HTTP exception details.
 * 
 * @param {any} detail - The error detail from the backend response
 * @param {string} fallback - A fallback message if extraction fails
 * @returns {string}
 */
export const extractErrorMessage = (detail, fallback = "An unexpected error occurred") => {
  if (!detail) return fallback;

  // Standard string error
  if (typeof detail === 'string') return detail;

  // FastAPI Validation Errors are typically an array of objects
  if (Array.isArray(detail)) {
    // Return the first error's message or join them
    return detail.map(err => {
      if (typeof err === 'string') return err;
      if (err && typeof err === 'object') {
        // Pydantic v2 format: { type, loc, msg, input }
        // Pydantic v1 format: { loc, msg, type }
        const field = err.loc ? err.loc[err.loc.length - 1] : null;
        return field ? `${field}: ${err.msg}` : err.msg;
      }
      return String(err);
    }).join(', ');
  }

  // If it's a single object (unlikely for detail, but just in case)
  if (typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  return String(detail) || fallback;
};
