-- Create the database for Lebanese Market
CREATE DATABASE lebanese_market;

-- Create a dedicated user (optional but recommended)
CREATE USER market_user WITH PASSWORD 'market_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lebanese_market TO market_user;

-- Connect to the new database
\c lebanese_market

-- Grant schema privileges (important for Prisma)
GRANT ALL ON SCHEMA public TO market_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO market_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO market_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO market_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO market_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO market_user;


