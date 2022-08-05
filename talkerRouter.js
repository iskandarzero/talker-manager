const express = require('express');
const fs = require('fs').promises;

const talkerFile = 'talker.json';

const router = express.Router();

const getTalker = async () => {
  const readTalker = await fs.readFile(talkerFile, 'utf8');
  const parseTalker = JSON.parse(readTalker);

  return parseTalker;
};

router.get('/', async (_req, res) => {
  const talkerList = await getTalker();

  res.status(200).json(talkerList);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const talkerList = await getTalker();
  const talker = talkerList.find((t) => t.id === Number(id));

  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  res.status(200).json(talker);
});

const auth = require('./auth-middleware');

router.use(auth.authorizationMiddleware);

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const talkerList = await getTalker();
  const talker = talkerList.filter((t) => t.id !== Number(id));
  const filteredList = JSON.stringify(talker);
  await fs.writeFile(talkerFile, filteredList);

  res.status(204).end();
});

router.use(
  auth.nameValidation,
  auth.ageValidation,
  auth.talkValidation,
  auth.dateValidation,
  auth.rateValidation,
  );

router.post('/', async (req, res) => {
  const { name, age, talk } = req.body;
  const talkerList = await getTalker();
  const resObj = { id: talkerList.length + 1, name, age, talk };
  talkerList.push(resObj);
  const filteredList = JSON.stringify(talkerList);

  await fs.writeFile(talkerFile, filteredList);

  res.status(201).json(resObj);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;

  const talkerList = await getTalker();
  const editedArr = talkerList.map((t) => (t
    .id === Number(id) ? { ...t, name, age, talk } : { ...t }));
  const filteredList = JSON.stringify(editedArr);

  await fs.writeFile(talkerFile, filteredList);

  res.status(200).json({ id: Number(id), name, age, talk });
});

module.exports = router;