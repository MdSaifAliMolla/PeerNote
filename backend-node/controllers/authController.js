const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/authMiddleware');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }
        
        console.log('Login attempt:', username);

        const user = await User.findOne({ where: { username } });

        if (!user || !(await user.checkPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.is_banned) {
            return res.status(403).json({
                error: 'Account banned',
                reason: user.ban_reason
            });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });

        user.last_poll = new Date();
        await user.save();

        res.cookie('token', token);
        return res.status(200).json({ token, is_admin: user.is_admin });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Signup:', username, email);

        const ip_address = req.ip || req.connection.remoteAddress;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            ip_address
        });

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Bad request', details: error.message });
    }
};

exports.pollOnline = async (req, res) => {
    try {
        const user = req.user;
        let ip_address = req.body.ip || req.ip || req.connection.remoteAddress;

        user.ip_address = ip_address;
        user.last_poll = new Date();
        await user.save();

        return res.status(200).json({
            Message: 'IP address updated successfully',
            username: user.username
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
