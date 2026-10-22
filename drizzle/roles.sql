-- Run ONCE by the owner role (Neon SQL editor or psql), after the migration.
-- Creates the restricted role used by the deployed app (DATABASE_URL).
-- Replace the password placeholder with a strong generated one, in the console only.
-- Do not commit a real password.

CREATE ROLE portfolio_app WITH LOGIN PASSWORD '<set-a-strong-password-here>';

GRANT USAGE ON SCHEMA public TO portfolio_app;
GRANT USAGE ON TYPE public.comment_status TO portfolio_app;

-- Comments: the app can only read and insert. Approve, pin, hide and delete are owner-only.
GRANT SELECT, INSERT ON TABLE public.comments TO portfolio_app;

-- Rate limiter counters.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rate_limits TO portfolio_app;
