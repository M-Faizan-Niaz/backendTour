const AppError = require('./../utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
  // just like this we transform the wiered error
  // recieving from mongoose into a operational error, with a nice friendly message a human can read
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

    // 2) Send generic Error
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong ',
    });
  }
};

// by specifying four argument here express automatically knows this
// is error handling middleware
module.exports = (err, req, res, next) => {
  // reading status code form an error obj
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    sendErrorProd(error, res);
  }
};
