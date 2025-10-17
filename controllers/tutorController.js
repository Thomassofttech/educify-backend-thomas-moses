const db = require('../config/db');

const listTutors = async (req, res, next) => {
  try {
    const { q, city, min_rate, max_rate, limit = 12, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    let where = [], params = [], idx = 1;
    if (q) { where.push(`(u.name ILIKE $${idx} OR l.title ILIKE $${idx})`); params.push(`%${q}%`); idx++; }
    if (city) { where.push(`t.city=$${idx}`); params.push(city); idx++; }
    if (min_rate) { where.push(`t.hourly_rate >= $${idx}`); params.push(min_rate); idx++; }
    if (max_rate) { where.push(`t.hourly_rate <= $${idx}`); params.push(max_rate); idx++; }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT t.id as tutor_id, u.name, u.avatar_url, t.hourly_rate, t.city,
        COALESCE(round(avg(r.rating)::numeric,1),0) as avg_rating
      FROM tutors t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN reviews r ON r.tutor_id = t.id
      LEFT JOIN lessons l ON l.tutor_id = t.id
      ${whereClause}
      GROUP BY t.id, u.name, u.avatar_url
      ORDER BY avg_rating DESC NULLS LAST
      LIMIT $${idx} OFFSET $${idx+1}`;
    params.push(limit, offset);
    const { rows } = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) { next(err); }
};

const getTutor = async (req, res, next) => {
  try {
    const id = req.params.id;
    const tutorQ = `SELECT t.*, u.name, u.avatar_url, u.bio FROM tutors t JOIN users u ON u.id = t.user_id WHERE t.id=$1`;
    const { rows: tutorRows } = await db.query(tutorQ, [id]);
    if (!tutorRows[0]) return res.status(404).json({ message: 'Tutor not found' });
    const lessons = (await db.query('SELECT * FROM lessons WHERE tutor_id=$1', [id])).rows;
    const reviews = (await db.query('SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON u.id=r.user_id WHERE r.tutor_id=$1 ORDER BY r.created_at DESC', [id])).rows;
    const schedule = (await db.query('SELECT * FROM schedules WHERE tutor_id=$1 ORDER BY day_of_week, start_time', [id])).rows;
    res.json({ tutor: tutorRows[0], lessons, reviews, schedule });
  } catch (err) { next(err); }
};

module.exports = { listTutors, getTutor };
