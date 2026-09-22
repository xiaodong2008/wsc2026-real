-- Submission query. Check the media schema before changing column names.
-- Month filter is on screenings, not bookings.
-- Count only completed bookings. Excluding cancelled is not the same thing
-- if the schema has a third status. Check the real column before submitting.
--   AND b.status = 'completed'
--   AND b.is_cancelled = 0
--   AND b.cancelled_at IS NULL
-- Revenue of 500 is excluded: HAVING ... > 500, not >= 500.
-- Ties break by movie_title ASC.

SELECT m.movie_title,
       ROUND(SUM(b.seats * b.price_per_seat), 2) AS total_revenue
FROM bookings b
JOIN screenings s ON s.screening_id = b.screening_id
JOIN movies m ON m.movie_id = s.movie_id
WHERE b.status = 'completed'
  AND s.screening_date >= '2026-03-01'
  AND s.screening_date < '2026-04-01'
GROUP BY m.movie_id, m.movie_title
HAVING ROUND(SUM(b.seats * b.price_per_seat), 2) > 500
ORDER BY total_revenue DESC, m.movie_title ASC;
