const { checkToken } = require('../utils/jwt');
const User = require('../models/users');
const Unauthorized = require('../errors/Unauthorized'); // 401

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    next(new Unauthorized('Авторизуйтесь для доступа'));
    return;
  }

  const token = auth.replace('Bearer ', '');

  try {
    const payload = checkToken(token);

    User.findOne({ _id: payload._id }).then((user) => {
      if (!user) {
        next(new Unauthorized('Авторизуйтесь для доступа'));
        return;
      }

      req.user = { id: user._id };

      next();
    });
  } catch (err) {
    next(new Unauthorized('Авторизуйтесь для доступа'));

    next(err);
  }
};

module.exports = { isAuthorized };
