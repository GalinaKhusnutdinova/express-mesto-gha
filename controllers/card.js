const Card = require('../models/card');

const ERROR_CODE = 400;
const NOT_FOUND = 404;
const SERVER_ERROR = 500;

// GET-запрос возвращает все карточки из базы данных.
module.exports.findCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создание карточки.',
        });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// POST-запрос создает новую карточку по переданным параметрам.
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные при создание карточки.',
        });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
    });
};

// DELETE-запрос удаляет карточку по _id.
module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(NOT_FOUND).send({
          message: 'Карточка с указанным _id не найдена..',
        });
      }
      return res.status(SERVER_ERROR).send({ message: 'Ошибка по умолчанию.' });
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
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные для постановки лайка.',
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
    .then((dislikes) => res.status(200).send({ data: dislikes }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(ERROR_CODE).send({
          message: 'Переданы некорректные данные для снятии лайка.',
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
