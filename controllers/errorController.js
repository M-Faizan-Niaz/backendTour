const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
  // just like this we transform the wiered error
  // recieving from mongoose into a operational error, with a nice friendly message a human can read
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]; // Extract duplicate value , regular expression match text between quotes
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // to loop over an element of objects
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// DISTINGUISHING ERRORS in development and production
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('Error 💥', err);
    //2)  send generic error
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
// by specifying four argument here express automatically knows this
// is error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // in production we wanna send the meaningful message to the client
    // Correctly copy the error object, preserving prototype and properties
    let error = Object.create(err);

    // Handle specific errors
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (error.code === 11000) error = handleDuplicateFieldsDB(err); // passing error that mongoose created into this function
    // this will then return a new error created with appError class, then that error will be marked as operational
    if (error.name === 'ValidationError') error = handleValidationErrorDB(err);
    sendErrorProd(error, res);
  }
};
