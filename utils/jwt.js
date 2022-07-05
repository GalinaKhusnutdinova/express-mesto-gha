const jwt = require('jsonwebtoken');

const SECRET_KEY = 'very_secret';

const generateToken = (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });

const checkToken = (token) => jwt.verify(token, SECRET_KEY);

module.exports = { generateToken, checkToken };
