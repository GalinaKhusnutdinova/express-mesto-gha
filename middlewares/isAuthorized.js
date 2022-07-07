const { checkToken } = require('../utils/jwt');
const Unauthorized = require('../errors/Unauthorized'); // 401

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    next(new Unauthorized('Авторизуйтесь для доступа'));
    return;
  }

  const token = auth.replace('Bearer ', '');
  let payload;

  try {
    payload = checkToken(token);
  } catch (err) {
    next(new Unauthorized('Авторизуйтесь для доступа'));
  }
  req.user = { _id: payload._id };

  next();
};

module.exports = { isAuthorized };
