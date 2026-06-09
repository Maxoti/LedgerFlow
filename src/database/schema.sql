-- ─────────────────────────────────────────────
-- LedgerFlow Database Schema
-- ─────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(255) PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20) UNIQUE NOT NULL,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── WALLETS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id         VARCHAR(255) PRIMARY KEY,
  user_id    VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance    NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
  currency   VARCHAR(10) DEFAULT 'KES',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- One wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- ─── TRANSACTIONS ────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id         VARCHAR(255) PRIMARY KEY,
  wallet_id  VARCHAR(255) NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
  amount     NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  reference  VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Idempotency — prevent duplicate transactions
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_reference 
  ON transactions(reference);

-- Fast lookup by wallet
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id 
  ON transactions(wallet_id);

-- ─── AUDIT LOG ───────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         SERIAL PRIMARY KEY,
  user_id    VARCHAR(255) REFERENCES users(id),
  action     VARCHAR(255) NOT NULL,
  details    JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── TRIGGERS: updated_at ────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();