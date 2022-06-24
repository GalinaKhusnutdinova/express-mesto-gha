const User = require('../models/users');
const { ERROR_CODE, NOT_FOUND, SERVER_ERROR } = require('../utils/utils');

// GET-запрос возвращает всех пользователей из базы данных
module.exports.findUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
};

// GET-запрос возвращает пользователя по переданному _id
module.exports.findByIdUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(() => {
      const error = new Error('Пользователь по указанному _id не найден.');
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.errors) {
        // получили все ключи
        const errorKeys = Object.keys(err.errors);
        // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
        const error = err.errors[errorKeys[0]];
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          res.status(ERROR_CODE).send({
            message: `Переданы некорректные данные при создание карточки. ${error}`,
          });
          return;
        }
      }
      if (err.statusCode === 404) {
        res.status(NOT_FOUND).send({
          message: err.message,
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// POST-запрос создаёт пользователя с переданными в теле запроса name, about, avatar
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные при создании пользователя, ${error}.`,
        });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// PATCH-запрос обновляет информацию о пользователе.
module.exports.updateUserMe = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .orFail(() => {
      const error = new Error('Пользователь с указанным _id не найден. ');
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные при обновлении профиля. ${error}.`,
        });
        return;
      }
      if (err.statusCode === 404) {
        res.status(NOT_FOUND).send({
          message: err.message,
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// PATCH-запрос обновляет аватар пользователя.
module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
    },
  )
    .orFail(() => {
      const error = new Error('Пользователь с указанным _id не найден. ');
      error.statusCode = 404;
      throw error;
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные при обновлении профиля. ${error}`,
        });
        return;
      }
      if (err.statusCode === 404) {
        res.status(NOT_FOUND).send({
          message: err.message,
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};
