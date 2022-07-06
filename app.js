const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const usersPouter = require('./routes/users');
const cardPouter = require('./routes/card');
const { regexUrl } = require('./utils/utils');
const { createUser, login } = require('./controllers/users');
const { isAuthorized } = require('./middlewares/isAuthorized');
const NotFound = require('./errors/NotFound'); // 404
const InternalServerError = require('./errors/InternalServerError'); // 500

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

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(new RegExp(regexUrl)),
  }),
}), createUser);

// app.use(isAuthorized);

app.use('/users', isAuthorized, usersPouter);
app.use('/cards', isAuthorized, cardPouter);

app.use((req, res, next) => next(new NotFound('Некорректный путь')));

app.use(errors()); // обработчик ошибок celebrate

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }
  next(new InternalServerError('Что-то пошло не так'));
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
