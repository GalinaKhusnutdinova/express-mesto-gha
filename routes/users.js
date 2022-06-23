const router = require('express').Router();

const {
  findUsers,
  findByIdUser,
  createUser,
  updateUserMe,
  updateUserAvatar,
} = require('../controllers/users');

// сработает при GET-запросе на URL /users
router.get('/', findUsers);

// сработает при GET-запросе на URL /users/:userId
router.get('/:userId', findByIdUser);

// сработает при POST-запросе на URL /users
router.post('/', createUser);

// сработает при PATCH-запросе на URL /users/me
router.patch('/me', updateUserMe);

// сработает при PATCH-запросе на URL /users/me/avatar
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
