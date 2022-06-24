const Card = require('../models/card');
const { ERROR_CODE, NOT_FOUND, SERVER_ERROR } = require('../utils/utils');

// GET-запрос возвращает все карточки из базы данных.
module.exports.findCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch(() => res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' }));
};

// POST-запрос создает новую карточку по переданным параметрам.
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные при создание карточки. ${error}`,
        });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// DELETE-запрос удаляет карточку по _id.
module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const error = new Error('Передан несуществующий _id карточки.');
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
          message: `Карточка с указанным _id не найдена. ${error}`,
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

// PUT-запрос добавляет лайк карточке.
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: { _id: req.user._id } } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Передан несуществующий _id карточки.');
      error.statusCode = 404;
      throw error;
    })
    .then((likes) => res.status(200).send({ likes }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные для постановки лайка. ${error}`,
        });
        return;
      }
      if (err.statusCode === 404) {
        res.status(NOT_FOUND).send({
          message: err.message,
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

// DELETE-запрос удаляет лайк с карточки.
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: { _id: req.user._id } } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Передан несуществующий _id карточки.');
      error.statusCode = 404;
      throw error;
    })
    .then((dislikes) => res.status(200).send({ dislikes }))
    .catch((err) => {
      // получили все ключи
      const errorKeys = Object.keys(err.errors);
      // взяли ошибку по первому ключу, и дальше уже в ней смотреть.
      const error = err.errors[errorKeys[0]];
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: `Переданы некорректные данные для снятии лайка. ${error}`,
        });
        return;
      }
      if (err.statusCode === 404) {
        res.status(NOT_FOUND).send({
          message: err.message,
        });
        return;
      }
      res.status(SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
