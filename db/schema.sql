-- basic schema for educify-backend (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(8,2) DEFAULT 10.00,
  languages TEXT[],
  verified BOOLEAN DEFAULT false,
  experience_years INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurring BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE SET NULL,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  start_timestamp TIMESTAMP NOT NULL,
  end_timestamp TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC(8,2),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  amount NUMERIC(8,2) NOT NULL,
  provider TEXT,
  provider_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
