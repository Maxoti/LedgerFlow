# LedgerFlow — Fintech Wallet API

A production-grade modular wallet API built with Node.js, PostgreSQL, and Redis. Designed to demonstrate core fintech backend engineering patterns including double-entry bookkeeping, idempotency, OTP authentication, and ACID-compliant transactions.

---

## Features

- JWT Authentication with OTP verification via SMS (Mobiwave)
- Wallet creation, credit, and debit operations
- ACID transactions with BEGIN/COMMIT/ROLLBACK
- Row-level locking to prevent race conditions
- Idempotency — duplicate transactions rejected at database level
- Full audit trail — every money movement recorded
- Redis OTP storage with 5-minute TTL
- Automated test suite (20 tests, 100% passing)
- Dockerized with PostgreSQL and Redis via docker-compose

---

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL (via pg)
- **Cache/OTP:** Redis
- **Auth:** JWT + bcrypt + OTP
- **SMS:** Mobiwave API
- **Testing:** Jest + Supertest
- **Containerization:** Docker + docker-compose

---

## Project Structure
src/
├── app.js
├── server.js
├── auth/           # Registration, login, OTP
├── wallets/        # Wallet creation, credit, debit
├── transactions/   # Transaction records and audit trail
├── users/          # User profile
├── notifications/  # SMS/OTP service
├── middleware/     # Auth and error handling
├── config/         # DB, Redis, environment
├── shared/         # Constants, response helpers
└── database/       # PostgreSQL schema

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email, password, phone |
| POST | `/api/auth/login` | Login, receive JWT |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP |

### Wallets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wallets` | Create wallet |
| POST | `/api/wallets/:id/credit` | Credit wallet |
| POST | `/api/wallets/:id/debit` | Debit wallet |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/wallet/:id` | Get wallet transactions |

---

## Key Engineering Decisions

### ACID Transactions
Every credit and debit wraps both the balance update and transaction record in a single PostgreSQL transaction. If either step fails, both are rolled back — no money moves without a corresponding audit record.

### Idempotency
Every transaction requires a unique `reference` field. A duplicate reference is rejected at the database level via a unique index — preventing double charges even under network retries.

### Row Locking
`SELECT ... FOR UPDATE` locks the wallet row during a transaction, preventing two simultaneous requests from both reading the same balance and executing conflicting operations.

### OTP via Redis
OTPs are stored in Redis with a 5-minute TTL and deleted immediately after successful verification — one-time use enforced at the storage layer.

---

## Running Locally

### With Docker (recommended)

```bash
docker-compose up --build
```

### Without Docker

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run PostgreSQL schema
psql -U postgres -d ledgerflow -f src/database/schema.sql

# Start server
npm run dev
```

---

## Running Tests

```bash
npm test
```

All 20 tests pass covering:
- Auth registration and login
- Wallet creation with foreign key enforcement
- Credit and debit with validation
- Insufficient funds rejection
- Idempotency enforcement
- Transaction audit trail
- Descending transaction ordering

---

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ledgerflow
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
MOBIWAVE_API_URL=https://sms.mobiwave.co.ke/api/v3/sms
MOBIWAVE_API_TOKEN=your_token
MOBIWAVE_SENDER_ID=LEDGER
SMS_ENABLED=true
```

---

## Author

Maxwell  — [GitHub](https://github.com/Maxoti)

Backend Engineer | Node.js | PostgreSQL | Redis | Docker