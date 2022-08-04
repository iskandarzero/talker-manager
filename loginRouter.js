const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());

const emailValidation = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^\w+(\[\+\.-\]?\w)*@\w+(\[\.-\]?\w+)*\.[a-z]+$/i;

  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  next();
};

const passwordValidation = (req, res, next) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  
  next();
};

router.post('/', emailValidation, passwordValidation, (_req, res) => {
  const generateToken = () => crypto.randomBytes(8).toString('hex');

  res.status(200).json({ token: generateToken() });
});

module.exports = router;