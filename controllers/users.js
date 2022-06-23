const User = require('../models/users');

const ERROR_CODE = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

// GET-запрос возвращает всех пользователей из базы данных
module.exports.findUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании пользователя.',
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
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
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      }
      if (err.statusCode === 404) {
        return res.status(NOT_FOUND).send({
          message: err.message,
        });
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
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании пользователя.',
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
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
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
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
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
