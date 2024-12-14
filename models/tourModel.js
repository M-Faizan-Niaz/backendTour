const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A toout must have a name '],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 charachters ',
      ],
      minlength: [10, 'A tour must have more or equal than 10 characters '],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      requied: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'], //validators
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy , medium , difficult ',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on a NEW creation document
          return val < this.price;
        },
        message: 'Discount Price should be below to regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      requied: [true, 'A tour must have a cover image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; // (this) pointing for a current document
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // this refers to a current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});*/

// QUERY MIDDLEWARE
tourSchema.pre(/⌃find/, function (next) {
  // this will not point to the current query
  // we are gonna process query , (this) here now a query object
  this.find({ secretTour: { $ne: true } });
  // to the query we chain another find method
  this.start = Date.now();
  next();
});

tourSchema.post(/⌃find/, function (docs, next) {
  // this middleware gonna run after query has executed
  console.log(`Query Took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
});

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  // this gonna point to current aggregation object
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());

  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
