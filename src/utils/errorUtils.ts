/**
 * Utility to parse error messages from API responses.
 * Handles string details, array details, and nested objects.
 */

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string | Array<string | { msg?: string; message?: string }> | Record<string, unknown>;
    };
  };
  message?: string;
}

export const parseErrorMessage = (err: unknown, fallbackMessage: string = 'An unexpected error occurred'): string => {
  if (!err) return fallbackMessage;

  const error = err as ApiErrorResponse;

  // Handle axios-style error response
  const response = error.response;
  if (response?.data?.detail) {
    const detail = response.data.detail;
    
    // Array of errors (e.g. Pydantic validation errors)
    if (Array.isArray(detail)) {
      return detail.map((item) => {
        if (typeof item === 'string') return item;
        return item.msg || item.message || JSON.stringify(item);
      }).join(' ');
    }
    
    // Single object error
    if (typeof detail === 'object' && detail !== null) {
      const objDetail = detail;
      return (objDetail.msg as string) || (objDetail.message as string) || 
             Object.keys(objDetail).map(k => {
               const val = objDetail[k];
               return `${k}: ${val !== null && typeof val === 'object' ? JSON.stringify(val) : String(val)}`;
             }).join('; ') || 
             fallbackMessage;
    }
    
    // Plain string error
    return typeof detail === 'string' ? detail : JSON.stringify(detail);
  }

  // Handle generic error message
  if (error.message) return error.message;
  
  return fallbackMessage;
};
