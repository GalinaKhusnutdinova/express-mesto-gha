const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const usersPouter = require('./routes/users');
const cardPouter = require('./routes/card');

const { createUser, login } = require('./controllers/users');
const { isAuthorized } = require('./middlewares/isAuthorized');

const app = express();

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb');

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

// app.post('/signin', login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().required().min(2),
  }).unknown(true),
}), createUser);

// app.post('/signup', createUser);

app.use('/users', isAuthorized, usersPouter);
app.use('/cards', isAuthorized, cardPouter);

app.use(errors()); // обработчик ошибок celebrate

app.use((req, res) => {
  res.status(404).send({ message: 'Некорректный путь' });
});

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err.stack);

  res.status(500).send({ message: 'Что-то пошло не так' });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
