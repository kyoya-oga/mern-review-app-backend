const { check, validationResult } = require('express-validator');

exports.userValidator = [
  check('name').trim().not().isEmpty().withMessage('Name is missing!'),
  check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is missing!')
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be between 8 and 30 characters long!'),
];
exports.signInValidator = [
  check('email').normalizeEmail().isEmail().withMessage('Email is invalid!'),
  check('password').trim().not().isEmpty().withMessage('Password is missing!'),
];

exports.validatePassword = [
  check('newPassword')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is missing!')
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be between 8 and 30 characters long!'),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};