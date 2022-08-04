const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());

const validateEmail = (req, _res, next) => {
  const { email } = req.body;
  if (email) next();
};

const validatePassword = (req, _res, next) => {
  const { password } = req.body;
  if (password) next();
};

router.post('/', validateEmail, validatePassword, (_req, res) => {
  const generateToken = () => crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token: generateToken() });
});

module.exports = router;