-- Practice schema for C06. The real media page shows the real columns.
-- Rename columns in result/result.sql if the day-of schema differs.
-- Six tables: ratings, movies, screens, customers, screenings, bookings.
-- Cancelled bookings use status = 'cancelled'. Other possibilities on the day:
--   is_cancelled = 1, or cancelled_at IS NOT NULL.

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS screenings;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS screens;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS ratings;

CREATE TABLE ratings (
  rating_id INTEGER PRIMARY KEY,
  rating_name VARCHAR(20) NOT NULL
);

CREATE TABLE movies (
  movie_id INTEGER PRIMARY KEY,
  movie_title VARCHAR(120) NOT NULL,
  rating_id INTEGER NOT NULL
);

CREATE TABLE screens (
  screen_id INTEGER PRIMARY KEY,
  screen_name VARCHAR(80) NOT NULL
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL
);

CREATE TABLE screenings (
  screening_id INTEGER PRIMARY KEY,
  movie_id INTEGER NOT NULL,
  screen_id INTEGER NOT NULL,
  screening_date DATE NOT NULL
);

CREATE TABLE bookings (
  booking_id INTEGER PRIMARY KEY,
  screening_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  price_per_seat DECIMAL(8, 2) NOT NULL,
  status VARCHAR(20) NOT NULL
);

INSERT INTO ratings (rating_id, rating_name) VALUES
  (1, 'PG'),
  (2, '12A');

INSERT INTO screens (screen_id, screen_name) VALUES
  (1, 'Screen 1'),
  (2, 'Screen 2');

INSERT INTO customers (customer_id, customer_name) VALUES
  (1, 'Ada'),
  (2, 'Ben');

INSERT INTO movies (movie_id, movie_title, rating_id) VALUES
  (1, 'Aurora', 1),
  (2, 'Borealis', 1),
  (3, 'Cascade', 2),
  (4, 'Glacier', 2),
  (5, 'Eclipse', 1),
  (6, 'Frost', 1),
  (7, 'March End', 2),
  (8, 'April Fool', 1);

INSERT INTO screenings (screening_id, movie_id, screen_id, screening_date) VALUES
  (1, 1, 1, '2026-03-05'),
  (2, 1, 1, '2026-02-20'),
  (3, 1, 2, '2026-03-18'),
  (4, 2, 1, '2026-03-10'),
  (5, 3, 2, '2026-03-02'),
  (6, 4, 1, '2026-03-22'),
  (7, 5, 2, '2026-02-28'),
  (8, 6, 1, '2026-03-15'),
  (9, 6, 2, '2026-03-16'),
  (10, 7, 1, '2026-03-31'),
  (11, 8, 2, '2026-04-01');

INSERT INTO bookings (booking_id, screening_id, customer_id, seats, price_per_seat, status) VALUES
  (1, 1, 1, 10, 40.00, 'completed'),
  (2, 3, 2, 8, 40.00, 'completed'),
  (3, 2, 1, 50, 100.00, 'completed'),
  (4, 4, 2, 10, 50.00, 'completed'),
  (5, 5, 1, 6, 100.00, 'completed'),
  (6, 6, 2, 12, 50.00, 'completed'),
  (7, 6, 1, 20, 100.00, 'cancelled'),
  (8, 7, 2, 20, 100.00, 'completed'),
  (9, 8, 1, 20, 100.00, 'cancelled'),
  (10, 9, 2, 4, 50.00, 'completed'),
  (11, 10, 1, 11, 50.00, 'completed'),
  (12, 11, 2, 40, 100.00, 'completed');
