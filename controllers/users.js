const User = require("../models/users");

module.exports.findUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.findByIdUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.updateUserMe = (req, res) => {
  const { name, about } = req.body;
  const _id = req.user._id;

  User.findByIdAndUpdate(_id, {name, about}, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
})
    .then((user) => res.status(200).send({ data: user }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const _id = req.user._id;

  User.findByIdAndUpdate(_id, { avatar }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
})
    .then((data) => res.status(200).send({ data }))
    .catch(() => res.status(500).send({ message: "Произошла ошибка" }));
};