const Card = require("../models/card");
const ERROR_CODE = 400;

module.exports.findCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  console.log(req.user._id);

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch(
      (err) => {
        if (err.name === "ValidstionError") {
          return res.status(400).send({
            message: "Переданы некорректные данные при создание карточки.",
          });
        }
        return res.status(500).send({ message: "Произошла ошибка" });
      }
    );
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((user) => res.status(200).send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: { _id: req.user._id } } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .then((likes) => res.status(200).send({ data: likes }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: { _id: req.user._id } } }, // убрать _id из массива
    { new: true }
  )
    .then((dislikes) => res.status(200).send({ data: dislikes }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};
