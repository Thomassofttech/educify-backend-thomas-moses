const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'learner' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password required' });
    const hashed = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role';
    const { rows } = await db.query(sql, [name, email, hashed, role]);
    const user = rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email already exists' });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });
    const { rows } = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
