const mongoose = require('mongoose');
// const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');

const regex = /https?:\/\/(www\.)?[-a-z0-9-._~:/?#@!$&'()*+,;=]+/gi;

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

// userSchema.statics.findUserByCredentials = function (email, password) {
//   return this.findOne({ email })
//     .then((user) => {
//       if (!user) {
//         return Promise.reject(new Error('Неправильные почта или пароль'));
//       }

//       return bcrypt.compare(password, user.password)
//         .then((matched) => {
//           if (!matched) {
//             return Promise.reject(new Error('Неправильные почта или пароль'));
//           }

//           return user; // теперь user доступен
//         });
//     });
// };

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
