const bcrypt = require('bcrypt');
const User = require('../models/users');
const { MONGO_DUPLICATE_ERROR_CODE } = require('../utils/utils');
const { generateToken } = require('../utils/jwt');

// error
const ValidationError = require('../errors/ValidationError'); // 400
const Unauthorized = require('../errors/Unauthorized'); // 401
const NotFound = require('../errors/NotFound'); // 404
const Conflict = require('../errors/Conflict'); // 409
const InternalServerError = require('../errors/InternalServerError'); // 500

// GET-запрос возвращает всех пользователей из базы данных
module.exports.findUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => next(new InternalServerError('Ошибка по умолчанию.')))
    .catch(next);
};

// GET-запрос возвращает пользователя по переданному _id
module.exports.findByIdUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      next(new NotFound('Пользователь по указанному _id не найден'));
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.errors) {
        // получили все ключи
        const errorKeys = Object.keys(err.errors);
        // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
        const error = err.errors[errorKeys[0]];
        if (err.name === 'ValidationError') {
          next(new ValidationError(`Переданы некорректные данные при создание пользователя. ${error}`));
          return;
        }
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при создание пользователя.'));
        return;
      }
      if (err.statusCode === 404) {
        next(new NotFound(err.message));
        return;
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    })
    .catch(next);
};

// GET-запрос возвращает пользователя
module.exports.findOnedUserMe = (req, res, next) => {
  User.findOne(req.user.id)
    .then((user) => {
      if (!user) {
        next(new NotFound('Пользователь по указанному _id не найден'));
        return;
      }
      res.status(200).send({
        _id: user._id,
        name: user.name,
        aboute: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.errors) {
        // получили все ключи
        const errorKeys = Object.keys(err.errors);
        // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
        const error = err.errors[errorKeys[0]];
        if (err.name === 'ValidationError') {
          next(new ValidationError(`Переданы некорректные данные при создание пользователя. ${error}`));
          return;
        }
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при создание пользователя.'));
        return;
      }
      if (err.statusCode === 404) {
        next(new NotFound(err.message));
        return;
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    })
    .catch(next);
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
      _id: user._id,
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
          next(new ValidationError(`Переданы некорректные данные при создание пользователя. ${error}`));
          return;
        }
      }

      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя.'));
        return;
      }

      next(new InternalServerError('Ошибка по умолчанию.'));
    })
    .catch(next);
};

// PATCH-запрос обновляет информацию о пользователе.
module.exports.updateUserMe = (req, res, next) => {
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
      next(new NotFound('Пользователь с указанным _id не найден.'));
    })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.errors) {
        // получили все ключи
        const errorKeys = Object.keys(err.errors);
        // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
        const error = err.errors[errorKeys[0]];
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          next(new ValidationError(`Переданы некорректные данные при обновлении профиля. ${error}`));
          return;
        }
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при обновлении профиля.'));
        return;
      }
      if (err.statusCode === 404) {
        next(new NotFound(err.message));
        return;
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    })
    .catch(next);
};

// PATCH-запрос обновляет аватар пользователя.
module.exports.updateUserAvatar = (req, res, next) => {
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
          next(new ValidationError(`Переданы некорректные данные при обновлении профиля. ${error}`));
          return;
        }
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при обновлении профиля.'));
        return;
      }
      if (err.statusCode === 404) {
        next(new NotFound(err.message));
        return;
      }
      next(new InternalServerError('Ошибка по умолчанию.'));
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new Unauthorized('Не передан емейл или пароль'));
    return;
  }

  User.findOne({ email }).select('+password')
    .then((foundUser) => {
      if (!foundUser) {
        throw new Unauthorized('Неправильный емейл или пароль');
      }

      return Promise.all([
        foundUser,
        bcrypt.compare(password, foundUser.password),
      ]);
    })
    .then(([user, isPasswordCorrect]) => {
      if (!isPasswordCorrect) {
        throw new Unauthorized('Неправильный емейл или пароль');
      }

      return generateToken({ _id: user._id });
    })
    .then((token) => {
      res.send({ token });
    })
    .catch(next);
};
