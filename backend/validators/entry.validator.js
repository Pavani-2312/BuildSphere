const { body, validationResult } = require('express-validator');
const { SECTIONS } = require('../config/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createEntryValidator = [
  body('weekId').isMongoId().withMessage('Valid week ID is required'),
  body('section').isIn(SECTIONS).withMessage('Invalid section'),
  body('data').isObject().withMessage('Entry data must be an object'),
  validate
];

module.exports = {
  createEntryValidator
};
