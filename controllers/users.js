const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { ERROR_CODE, NOT_FOUND, SERVER_ERROR, MONGO_DUPLICATE_ERROR_CODE} = require('../utils/utils');
const { generateToken } = require('../utils/jwt');

// error
const ValidationError = require('../errors/ValidationError'); // 400
const Unauthorized = require('../errors/Unauthorized'); // 401
const Forbidden = require('../errors/Forbidden'); // 403
const NotFound = require('../errors/NotFound'); // 404
const Conflict = require('../errors/Conflict'); // 409
const InternalServerError = require('../errors/InternalServerError'); // 500

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
        if (err.name === 'ValidationError') {
          res.status(ERROR_CODE).send({
            message: `Переданы некорректные данные при создание пользователя. ${error}`,
          });
          return;
        }
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создание пользователя.',
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

// POST-запрос создаёт пользователя с переданными в теле запроса name, about, avatar, email,
// password
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new Unauthorized('Не передан емейл или пароль');
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      message: 'Пользователь создан',
      name: user.name,
      aboute: user.about,
      avatar: user.avatar,
      email: user.email,
    }))
    .catch((err) => {
      if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        next(new Conflict('Пользователь с таким email уже существует'));
      }

      if (err.errors) { // получили все ключи
        const errorKeys = Object.keys(err.errors);
        // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
        const error = err.errors[errorKeys[0]];
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          return res.status(ERROR_CODE).send({
            message: `Переданы некорректные данные при создании пользователя, ${error}.`,
          });
        }
      }

      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.'));
      }

      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    })
    .catch(next);
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
      if (err.errors) {
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
      }
      if (err.name === 'CastError') {
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
      throw new NotFound('Не передан емейл или пароль');
    })
    .then((data) => res.status(200).send({ data }))
    .catch((err) => {
      if (err.errors) {
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
      }
      if (err.name === 'CastError') {
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

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Unauthorized('Не передан емейл или пароль');
  }

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // const err = new Error('Неправильный емейл или пароль');
        // err.statusCode = 401;
        // throw err;
        throw new Unauthorized('Неправильный емейл или пароль');
      }

      return Promise.all([
        foundUser,
        bcrypt.compare(password, foundUser.password),
      ]);
    })
    .then(([user, isPasswordCorrect]) => {
      if (!isPasswordCorrect) {
        // const err = new Error('Неправильный емейл или пароль');
        // err.statusCode = 401;
        // throw err;
        throw new Unauthorized('Неправильный емейл или пароль');
      }

      return generateToken({ _id: user._id });
    })
    .then((token) => {
      res.send({ token });
    })
    .catch(next);
};
