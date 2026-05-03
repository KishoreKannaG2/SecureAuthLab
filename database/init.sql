-- SecureAuth Lab — PostgreSQL Schema
-- Run this manually OR let Django migrations handle it (recommended)

CREATE DATABASE secureauthlab;
\c secureauthlab;

-- Users table (managed by Django's ORM)
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    username         VARCHAR(50)  UNIQUE NOT NULL,
    email            VARCHAR(254) UNIQUE NOT NULL,
    full_name        VARCHAR(100) DEFAULT '',
    password         VARCHAR(128) NOT NULL,      -- PBKDF2-SHA256 hash
    is_active        BOOLEAN DEFAULT TRUE,
    is_staff         BOOLEAN DEFAULT FALSE,
    is_superuser     BOOLEAN DEFAULT FALSE,
    is_locked        BOOLEAN DEFAULT FALSE,
    failed_attempts  INTEGER DEFAULT 0,
    locked_until     TIMESTAMPTZ,
    date_joined      TIMESTAMPTZ DEFAULT NOW(),
    last_login       TIMESTAMPTZ,
    last_login_ip    INET
);

-- Protected sensitive data
CREATE TABLE IF NOT EXISTS protected_data (
    id          SERIAL PRIMARY KEY,
    owner_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    secret      TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Login attempts log
CREATE TABLE IF NOT EXISTS login_attempts (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) NOT NULL,
    ip_address  INET NOT NULL,
    user_agent  TEXT DEFAULT '',
    success     BOOLEAN DEFAULT FALSE,
    timestamp   TIMESTAMPTZ DEFAULT NOW(),
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Attack sessions
CREATE TABLE IF NOT EXISTS attack_sessions (
    id               SERIAL PRIMARY KEY,
    ip_address       INET NOT NULL,
    target_username  VARCHAR(50) NOT NULL,
    start_time       TIMESTAMPTZ DEFAULT NOW(),
    end_time         TIMESTAMPTZ,
    total_attempts   INTEGER DEFAULT 0,
    status           VARCHAR(20) DEFAULT 'active',
    cracked          BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_ip        ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_username  ON login_attempts(username);
CREATE INDEX idx_login_attempts_timestamp ON login_attempts(timestamp);
CREATE INDEX idx_users_username           ON users(username);

-- Seed: demo admin user (password: Admin@1234)
-- Password is Django's PBKDF2-SHA256 hash — DO NOT store plain text
-- Use: python manage.py createsuperuser
