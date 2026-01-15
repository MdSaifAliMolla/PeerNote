const adminMiddleware = (req, res, next) => {
  // authMiddleware must run first and set req.user
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication credentials were not provided.' });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

module.exports = adminMiddleware;
