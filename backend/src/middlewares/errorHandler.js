const ApiError = require('../utils/ApiError');

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
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = () =>
  new ApiError(401, 'Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  new ApiError(401, 'Your token has expired! Please log in again.');

const handlePostgresError = (err) => {
  let message = 'Database error occurred';
  
  switch (err.code) {
    case '23505': // unique_violation
      const match = err.detail.match(/Key \((.+)\)=\((.+)\) already exists/);
      if (match) {
        message = `${match[1]} '${match[2]}' already exists`;
      } else {
        message = 'Duplicate value exists';
      }
      return new ApiError(409, message);
      
    case '23503': // foreign_key_violation
      message = 'Referenced record does not exist';
      return new ApiError(400, message);
      
    case '23502': // not_null_violation
      message = `${err.column} is required`;
      return new ApiError(400, message);
      
    case '23514': // check_violation
      message = 'Invalid data provided';
      return new ApiError(400, message);
      
    case '42P01': // undefined_table
      message = 'Database table not found';
      return new ApiError(500, message);
      
    case '42703': // undefined_column
      message = 'Database column not found';
      return new ApiError(500, message);
      
    default:
      return new ApiError(500, 'Database operation failed');
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // PostgreSQL errors
    if (err.code) {
      error = handlePostgresError(error);
    }
    
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle unhandled routes
const notFound = (req, res, next) => {
  const err = new ApiError(404, `Can't find ${req.originalUrl} on this server!`);
  next(err);
};

module.exports = {
  globalErrorHandler,
  notFound,
};