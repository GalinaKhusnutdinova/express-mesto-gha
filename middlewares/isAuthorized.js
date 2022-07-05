const { checkToken } = require('../utils/jwt');
const User = require('../models/users');
const Unauthorized = require('../errors/Unauthorized'); // 401

const throwUnauthorizedError = () => {
  throw new Unauthorized('Авторизуйтесь для доступа');
};

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    throwUnauthorizedError();
  }

  const token = auth.replace('Bearer ', '');

  try {
    const payload = checkToken(token);
    console.log(payload);

    User.findOne({ email: payload.email }).then((user) => {
      if (!user) {
        throwUnauthorizedError();
      }

      req.user = { id: user._id };

      next();
    });

    // проверить пользователя
  } catch (err) {
    throwUnauthorizedError();
  }
};

module.exports = { isAuthorized };
