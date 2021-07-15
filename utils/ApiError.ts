class ApiError extends Error {
    constructor(statusCode: any, message: any, isOperational = true, stack = '') {
      super(message);
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export default ApiError;
  