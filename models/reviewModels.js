const mongoose = require('mongoose');

const Tour = require('./tourModels');
const { findByIdAndUpdate, findByIdAndDelete } = require('./userModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'You must provide a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },

  {
    toJSON: { virtuals: true }, // When i have a value calculated but not stored in database
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
// reviewSchema.pre('save', async function (next) {
//   // This refers to the document being saved
//   const user = await this.model('User')
//     .findById(this.user)
//     .select('name photo');
//   const tour = await this.model('Tour').findById(this.tour).select('name');
//   this.user = user;
//   this.tour = tour;
//   next();
// });

// we used statics because we want to use aggregate
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function (next) {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
  // this.constructor = Review
});

// findByIdAndUpdate   implement Query middlware
// findByIdAndDelete   .........................  findOneAnd it's short hand for <=

reviewSchema.pre(/^findOneAnd/, function (next) {
  // console.log('Query filter:', this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  if (doc) {
    // console.log('Query result:', doc);
    await doc.constructor.calcAverageRatings(doc.tour);
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
