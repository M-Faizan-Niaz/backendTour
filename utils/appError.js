class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // only parameter builtin Error accepts, like calling Error
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'err';
    this.isOperational = true;
    // all the errors that we create using Apperror will be
    // marked as isOperational=true
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
