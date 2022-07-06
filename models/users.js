const mongoose = require('mongoose');
const { default: isEmail } = require('validator/lib/isEmail');
const { regex } = require('../utils/utils');

// Опишем схему:
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validator: {
      validate: {
        validator: (v) => isEmail(v),
        message: 'Заполните email в правльном формате',
      },
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    match: [regex, 'Пожалуйста, заполните действительный URL-адрес'],
  },
});

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
