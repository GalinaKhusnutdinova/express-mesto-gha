const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regexUrl } = require('../utils/utils');

const {
  findCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/card');

// сработает при GET-запросе на URL /cards возвращает все карточки
router.get('/', findCards);

// сработает при POST-запросе на URL //cards — создаёт карточку
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(new RegExp(regexUrl)),
  }),
}), createCard);

// сработает при DELETE-запросе на URL /:cardId — удаляет карточку по идентификатору
router.delete('/:cardId', celebrate({
  // валидируем параметры
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string(),
  }).unknown(true),
}), deleteCard);

// сработает при PUT-запросе на URL /:cardId/likes — поставить лайк карточке
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string(),
  }).unknown(true),
}), likeCard);

// сработает при DELETE-запросе на URL /:cardId/likes — поставить дизлайк карточке
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: Joi.object().keys({
    authorization: Joi.string(),
  }).unknown(true),
}), dislikeCard);

module.exports = router;
