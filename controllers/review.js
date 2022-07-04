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

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, 'Invalid review');

  const review = await Review.findOne({ _id: reviewId, owner: userId });
  if (!review) return sendError(res, 'Review not found', 404);

  // remove review from movie
  const movie = await Movie.findById(review.parentMovie).select('reviews');
  movie.reviews = movie.reviews.filter((rId) => rId.toString() !== reviewId);

  await movie.save();
  await Review.findByIdAndDelete(reviewId);

  res.json({ message: 'Review removed successfully' });
};

exports.getReviewsByMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) return sendError(res, 'Invalid movie');

  const movie = await Movie.findById(movieId)
    .populate({
      path: 'reviews',
      populate: { path: 'owner', select: 'name' },
    })
    .select('reviews');

  const reviews = movie.reviews.map((r) => {
    const { owner, content, rating, _id: reviewId } = r;
    const { name, _id: ownerId } = owner;
    return {
      id: reviewId,
      owner: { name, id: ownerId },
      content,
      rating,
    };
  });

  res.json({ reviews });
};
