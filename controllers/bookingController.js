const db = require('../config/db');

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tutor_id, lesson_id, start_timestamp, end_timestamp } = req.body;
    if (!tutor_id || !lesson_id || !start_timestamp || !end_timestamp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // check conflict: overlapping confirmed/pending bookings
    const conflictQ = `SELECT 1 FROM bookings WHERE tutor_id=$1 AND status IN ('confirmed','pending') AND NOT ($3 <= start_timestamp OR $2 >= end_timestamp) LIMIT 1`;
    const { rows: conflictRows } = await db.query(conflictQ, [tutor_id, start_timestamp, end_timestamp]);
    if (conflictRows.length) return res.status(409).json({ message: 'Slot not available' });

    // get price from lesson
    const lessonRes = await db.query('SELECT price FROM lessons WHERE id=$1', [lesson_id]);
    const price = lessonRes.rows[0] ? lessonRes.rows[0].price : null;

    const insertQ = `INSERT INTO bookings (user_id, tutor_id, lesson_id, start_timestamp, end_timestamp, amount) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows } = await db.query(insertQ, [userId, tutor_id, lesson_id, start_timestamp, end_timestamp, price]);
    res.status(201).json({ booking: rows[0] });
  } catch (err) { next(err); }
};

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { rows } = await db.query('SELECT b.*, u.name as tutor_name FROM bookings b LEFT JOIN tutors t ON t.id=b.tutor_id LEFT JOIN users u ON u.id = t.user_id WHERE b.user_id=$1 ORDER BY b.start_timestamp DESC', [userId]);
    res.json({ bookings: rows });
  } catch (err) { next(err); }
};

module.exports = { createBooking, getUserBookings };
