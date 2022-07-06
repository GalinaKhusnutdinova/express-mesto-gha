const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  findUsers,
  findByIdUser,
  updateUserMe,
  updateUserAvatar,
  findOnedUserMe,
} = require('../controllers/users');

// сработает при GET-запросе на URL /users
router.get('/', findUsers);

// сработает при GET-запросе на URL /users/me
router.get('/me', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().required().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string(),
  }).unknown(true),
}), findOnedUserMe);

// сработает при GET-запросе на URL /users/:userId
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string(),
  }).unknown(true),
}), findByIdUser);

// сработает при PATCH-запросе на URL /users/me
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), updateUserMe);

// сработает при PATCH-запросе на URL /users/me/avatar
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }).unknown(true),
}), updateUserAvatar);

module.exports = router;
