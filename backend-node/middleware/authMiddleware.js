const jwt = require('jsonwebtoken');
const { User } = require('../models');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication credentials were not provided.' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token> or Token <token>

    if (!token) {
        return res.status(401).json({ error: 'Authentication credentials were not provided.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authMiddleware, SECRET_KEY };
