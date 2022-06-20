const express = require('express');
const { uploadTrailer, createMovie } = require('../controllers/movie');
const { isAuth, isAdmin } = require('../middlewares/auth');
const { parseData } = require('../middlewares/helper');
const { uploadVideo, uploadImage } = require('../middlewares/multer');
const { validateMovie, validate } = require('../middlewares/validator');
const router = express.Router();

router.post(
  '/upload-trailer',
  isAuth,
  isAdmin,
  uploadVideo.single('video'),
  uploadTrailer
);

router.post(
  '/create',
  isAuth,
  isAdmin,
  uploadImage.single('poster'),
  parseData,
  validateMovie,
  validate,
  createMovie
);

module.exports = router;
