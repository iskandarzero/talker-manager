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

const auth = require('./auth-middleware');

router.post('/', auth.authorizationMiddleware, auth.nameValidation, auth.ageValidation,
auth.talkValidation, auth.dateValidation, auth.rateValidation, async (req, res) => {
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
});

module.exports = router;