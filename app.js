const express = require('express'); // requiring express package
const morgan = require('morgan');

const AppError = require('./utils/appError');
const golbalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// tours is itself resourse

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// the idea is if we have a request that make into this point here
// of a code this means that neither the tour router nor the tourRouter
// were able to catch it
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(golbalErrorHandler);

module.exports = app;

// routing means simply to detrmine how an application responds to a certain client request to a certain URL
