const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const regexUrl = require('../utils/utils');

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
router.get('/me', findOnedUserMe);

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
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }).unknown(true),
}), updateUserMe);

// сработает при PATCH-запросе на URL /users/me/avatar
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(new RegExp(regexUrl)),
  }),
}), updateUserAvatar);

module.exports = router;
