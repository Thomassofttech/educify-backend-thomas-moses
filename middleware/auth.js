const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query('SELECT id, email, name, role FROM users WHERE id=$1', [payload.userId]);
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
