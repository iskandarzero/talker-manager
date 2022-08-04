const express = require('express');
const fs = require('fs').promises;

const talkerFile = 'talker.json';

const router = express.Router();

router.get('/', async (_req, res) => {
  const talkerJson = await fs.readFile(talkerFile, 'utf8');
  const talkerArr = JSON.parse(talkerJson);
  
  res.status(200).json(talkerArr);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const talkerJson = await fs.readFile(talkerFile, 'utf8');
  const talkerArr = JSON.parse(talkerJson);
  const talker = talkerArr.find((t) => t.id === Number(id));

  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  res.status(200).json(talker);
});

const authorizationMiddleware = require('./auth-middleware');

const nameValidation = (req, res, next) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const ageValidation = (req, res, next) => {
  const { age } = req.body;

  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (Number(age) < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const talkValidation = (req, res, next) => {
  const { talk } = req.body;

  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  const keys = Object.keys(talk);
  if (!keys.includes('rate')) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (!keys.includes('watchedAt')) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }

  next();
};

const dateValidation = (req, res, next) => {
  const { talk } = req.body;
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (!talk.watchedAt.match(regex)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }

  next();
};

const rateValidation = (req, res, next) => {
  const { talk } = req.body;
  const { rate } = talk;

  if (rate < 1 || rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }

  next();
};

router.post(
  '/',
  authorizationMiddleware, 
  nameValidation,
  ageValidation,
  talkValidation,
  dateValidation,
  rateValidation,
  async (req, res) => {
  const { name, age, talk } = req.body;

  const talkerJson = await fs.readFile(talkerFile, 'utf8');
  const talkerArr = JSON.parse(talkerJson);
  const resObj = {
    id: talkerArr.length + 1,
    name,
    age,
    talk,
  };
  talkerArr.push(resObj);
  const newTalkerArr = JSON.stringify(talkerArr);

  await fs.writeFile('talker.json', newTalkerArr);

  res.status(201).json(resObj);
},
);

module.exports = router;