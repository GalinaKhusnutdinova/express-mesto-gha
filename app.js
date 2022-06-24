const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersPouter = require('./routes/users');
const cardPouter = require('./routes/card');

const app = express();

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

// мидлвэр временное решение
app.use((req, res, next) => {
  req.user = {
    _id: '62b3244c2d82aadc5b28c5d9', // _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/users', usersPouter);

app.use('/cards', cardPouter);

app.use((req, res) => {
  res.status(404).send({ message: 'Некорректный путь' });
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ message: err.message });

  next();
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
