const router = require('express').Router();

const { findCards, createCard, deleteCard, likeCard, dislikeCard} = require('../controllers/card')

// сработает при GET-запросе на URL /cards возвращает все карточки
router.get('/', findCards)

// сработает при POST-запросе на URL //cards — создаёт карточку
router.post('/', createCard);

// сработает при DELETE-запросе на URL /:cardId — удаляет карточку по идентификатору
router.delete('/:cardId', deleteCard);

// сработает при PUT-запросе на URL /:cardId/likes — поставить лайк карточке
router.put('./:cardId/likes', likeCard)

// сработает при DELETE-запросе на URL /:cardId/likes — поставить лайк карточке
router.delete('./:cardId/likes', dislikeCard)


module.exports = router;