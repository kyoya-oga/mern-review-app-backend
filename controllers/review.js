const { isValidObjectId } = require('mongoose');
const Movie = require('../models/movie');
const Review = require('../models/review');
const { sendError } = require('../utils/helper');

exports.addReview = async (req, res) => {
  const { movieId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(movieId)) return sendError(res, 'Invalid movie');

  const movie = await Movie.findOne({ _id: movieId, status: 'public' });
  if (!movie) return sendError(res, 'Movie not found', 404);

  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentMovie: movie._id,
  });
  if (isAlreadyReviewed)
    return sendError(res, 'Invalid request! You already reviewed this movie');

  const newReview = new Review({
    owner: userId,
    parentMovie: movie._id,
    content,
    rating,
  });

  // update reviews for movie
  movie.reviews.push(newReview._id);
  await movie.save();

  // save review
  await newReview.save();

  res.json({ message: 'Your review added successfully' });
};

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, 'Invalid review');

  const review = await Review.findOne({ _id: reviewId, owner: userId });
  if (!review) return sendError(res, 'Review not found', 404);

  review.content = content;
  review.rating = rating;

  await review.save();

  res.json({ message: 'Your review updated successfully' });
};
