const { User } = require('../models');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'ip_address', 'last_poll', 'points', 'is_admin'],
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (e) {
    console.error('listUsers error:', e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.toggleAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.is_admin = !user.is_admin;
    await user.save();
    res.json({ id: user.id, is_admin: user.is_admin });
  } catch (e) {
    console.error('toggleAdmin error:', e);
    res.status(500).json({ error: 'Failed to toggle admin status' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.is_banned = true;
    user.ban_reason = reason || 'Violation of terms';
    await user.save();
    res.json({ id: user.id, is_banned: user.is_banned, ban_reason: user.ban_reason });
  } catch (e) {
    console.error('banUser error:', e);
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.is_banned = false;
    user.ban_reason = null;
    await user.save();
    res.json({ id: user.id, is_banned: user.is_banned });
  } catch (e) {
    console.error('unbanUser error:', e);
    res.status(500).json({ error: 'Failed to unban user' });
  }
};
