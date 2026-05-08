# 🏦 Bank Management System

> A full-stack web application simulating core banking operations — built with Node.js, Express, EJS, and MySQL.

---

## Overview

This is a **server-rendered banking application** that models the operational workflow of a retail bank. It implements two distinct portals:

- **Customer Portal** — Registration, login, account opening, deposits, withdrawals, loan applications, transaction history, and profile management.
- **Admin Portal** — Customer management, account approval/rejection, transaction oversight, transaction reversals, loan review, and account deactivation.

The system is built as a **monolithic Express application** using EJS for server-side templating and MySQL as the persistent data store. It demonstrates practical understanding of relational database design, session-based authentication, transactional integrity, and role-based access patterns — typical of a DBMS course project elevated with a functional web interface.

---

## Features

### Customer Features
- **Registration & Login** — Email/password authentication with bcrypt hashing
- **Account Opening** — Apply for Personal or Business accounts across multiple banks/branches; accounts require admin approval
- **Deposit & Withdrawal** — Password-verified financial transactions with balance validation
- **Balance Inquiry** — AJAX-powered account detail fetching with a toggle-to-reveal balance
- **Transaction History** — Tabular view of all past transactions with type, status, date, and time
- **Loan Application** — Income-based EMI calculator with dynamic tenure/interest computation
- **Profile Management** — View and update personal details (name, phone, address, DOB, city, state, pincode)
- **Password Recovery** — Identity verification via Customer ID + Name + Phone, then password reset
- **Help Section** — Contextual documentation for account management, loans, transactions, and support

### Admin Features
- **Separate Admin Login** — Credential-based admin authentication
- **View All Customers** — Full customer directory
- **Approve/Reject Accounts** — Review pending account applications
- **Deactivate Accounts** — Disable active customer accounts
- **View All Transactions** — System-wide transaction ledger
- **Reverse Transactions** — Roll back completed transactions (with balance restoration and audit trail)
- **Review Loan Applications** — View all loan applications with status filtering
- **Approve/Reject Loans** — On approval, loan amount is credited to the customer's account balance
- **View Active Loans** — Filter to only approved loans
- **Dark/Light Mode** — Theme toggle across admin views

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│   HTML / EJS Templates / jQuery AJAX / Inline CSS            │
└──────────────────────┬───────────────────────────────────────┘
                       │  HTTP (GET/POST)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express.js Server (back.js)                │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Middleware  │───▶│  Router      │───▶│  Handler         │  │
│  │ (session,  │    │ (routings.js)│    │  (handler.js)    │  │
│  │  cookies,  │    │  ~40 routes  │    │  ~1170 lines     │  │
│  │  body-     │    │              │    │  all business    │  │
│  │  parser)   │    │              │    │  logic           │  │
│  └────────────┘    └──────────────┘    └────────┬─────────┘  │
└─────────────────────────────────────────────────┼────────────┘
                                                  │ SQL Queries
                                                  ▼
                                    ┌──────────────────────┐
                                    │   MySQL Database     │
                                    │  ┌────────────────┐  │
                                    │  │ customer       │  │
                                    │  │ account        │  │
                                    │  │ transactions   │  │
                                    │  │ loan_applic... │  │
                                    │  │ admin          │  │
                                    │  └────────────────┘  │
                                    └──────────────────────┘
```

**Request Flow:**
1. Browser sends GET/POST request
2. Express router (`routings.js`) matches the route
3. Corresponding handler function in `handler.js` executes business logic
4. Handler queries MySQL via `mysql2`, processes results
5. Response is either a rendered EJS template, a redirect, or a JSON payload (for AJAX)

---

## Tech Stack

| Category       | Technology                                                     |
|----------------|----------------------------------------------------------------|
| **Runtime**    | Node.js                                                        |
| **Framework**  | Express.js 4.x                                                 |
| **Templating** | EJS (Embedded JavaScript)                                      |
| **Database**   | MySQL (via `mysql2` driver)                                    |
| **Auth**       | bcrypt (password hashing), express-session (session management)|
| **Utilities**  | cookie-parser, dotenv, crypto, nodemailer                      |
| **Frontend**   | Vanilla HTML/CSS, jQuery (AJAX), inline dark/light mode toggles|
| **Dev Tools**  | nodemon (auto-restart on file changes)                         |

---

## Project Structure

```
bank-management-system/
│
├── back.js                          # Express server entry point (port 3000)
├── routings.js                      # All route definitions (~40 routes)
├── handler.js                       # All route handlers / business logic (~1170 lines)
├── db.js                            # MySQL connection setup (uses dotenv)
├── index.js                         # Client-side jQuery (profile card toggle, tab switching)
├── package.json                     # Dependencies manifest
│
├── dashboard.html                   # Landing page (Sign In / Sign Up / Admin)
├── login.html                       # Customer login page
├── register.html                    # Customer registration form
├── adminlogin.html                  # Admin login page
│
├── dashboard.ejs                    # Main customer dashboard (accounts, withdraw, deposit)
├── veryfirstdashboardafterlogin.ejs # Dashboard for new users with no approved accounts
├── admindash.ejs                    # Admin dashboard with management sections
├── profile.ejs                      # Customer profile view/edit
├── transactions.ejs                 # Customer transaction history table
├── createaccount.ejs                # Bank account creation form
├── loanapplicationform.ejs          # Loan application with dynamic EMI calculator
├── loansuccessani.ejs               # Loan submission success animation
├── acc_cre_succ_ani.ejs             # Account creation success animation
├── approveaccounts.ejs              # Admin: approve/reject pending accounts
├── deactivateaccounts.ejs           # Admin: deactivate active accounts
├── admtrans.ejs                     # Admin: transactions with reversal capability
├── admtrans1.ejs                    # Admin: all transactions view
├── lanview.ejs                      # Admin: pending loan applications
├── lanviewview.ejs                  # Admin: all loan applications
├── viewee.ejs                       # Admin: all registered customers
├── recovery.ejs                     # Password recovery form
├── passupdate.ejs                   # Password update form
├── helphelp.ejs                     # Help/FAQ documentation page
├── errorinsbal.ejs                  # Generic error display page
├── login1.ejs                       # Alternate login view (EJS)
│
├── styles.css                       # Main dashboard layout styles
├── login.css                        # Login page styles
├── asset1.jpg                       # Bank logo/branding image
├── asset2.png                       # Secondary asset
└── dropdown.svg                     # Dropdown icon for profile menu
```

---

## How It Works

### Customer Workflow
1. **Visit** `localhost:3000/dashboard` → Landing page with Sign In / Sign Up options
2. **Register** → Fill in name, email, phone, DOB, address, password → Receive a 6-digit Customer ID
3. **Login** → Authenticate with email + password → Session created
4. **Open Account** → Select bank, branch, account type, initial balance → Application goes to "pending"
5. **Admin Approves** → Account status changes to "approved", customer can now transact
6. **Deposit/Withdraw** → Select account, enter password + amount → Balance updated atomically
7. **Apply for Loan** → Select income range → EMI options populated → Select loan amount → Tenure/interest auto-calculated
8. **View History** → All transactions displayed with status (success/failed/reversed)

### Admin Workflow
1. **Login** at `/admlog` → Authenticated via separate `admin` table
2. **Approve Accounts** → View pending applications, approve or reject each
3. **Manage Transactions** → View all, reverse specific transactions (restores balance + creates audit record)
4. **Review Loans** → Approve (credits loan amount to account) or reject applications
5. **Deactivate Accounts** → Set account status to "inactive"

---

## Setup & Installation

### Prerequisites
- **Node.js** (v14+)
- **MySQL** (v5.7+ or v8.x)

### 1. Clone the Repository
```bash
git clone https://github.com/shivadeepak99/bank-management-system.git
cd bank-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up the Database

Create a MySQL database and the required tables:

```sql
CREATE DATABASE bank_management;
USE bank_management;

CREATE TABLE customer (
    customer_id VARCHAR(10) PRIMARY KEY,
    phone_number VARCHAR(15),
    name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    dateofbirth DATE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    password VARCHAR(255)
);

CREATE TABLE account (
    Account_no VARCHAR(20) PRIMARY KEY,
    Account_type VARCHAR(50),
    Branch_id VARCHAR(10),
    Balance DECIMAL(15,2),
    customer_id VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(10),
    Account_no VARCHAR(20),
    amount DECIMAL(15,2),
    transaction_type VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (Account_no) REFERENCES account(Account_no)
);

CREATE TABLE loan_applications (
    loan_id INT PRIMARY KEY,
    customer_id VARCHAR(10),
    account_no VARCHAR(20),
    nmi VARCHAR(20),
    emi VARCHAR(20),
    loanAmount DECIMAL(15,2),
    tenure INT,
    repayment VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Pending',
    interest DECIMAL(5,2),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (account_no) REFERENCES account(Account_no)
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255)
);
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bank_management
SESSION_SECRET=your_session_secret_key
```

### 5. Fix the DB Import Path

The `handler.js` file imports from `./dbcon/db`. Either:
- Create a `dbcon/` directory and move `db.js` into it, **or**
- Update line 2 of `handler.js` from `require('./dbcon/db')` to `require('./db')`

### 6. Start the Server
```bash
npx nodemon back.js
```

The application will be available at **http://localhost:3000**

---

## Environment Variables

| Variable         | Description                        | Example               |
|------------------|------------------------------------|-----------------------|
| `DB_HOST`        | MySQL server hostname              | `localhost`           |
| `DB_USER`        | MySQL username                     | `root`               |
| `DB_PASSWORD`    | MySQL password                     | `password123`         |
| `DB_NAME`        | MySQL database name                | `bank_management`     |
| `SESSION_SECRET` | Secret key for express-session     | `s3cr3t_k3y_h3r3`    |

---

## API / Route Documentation

### Public Routes
| Method | Route              | Description                           |
|--------|--------------------|---------------------------------------|
| GET    | `/dashboard`       | Landing page (Sign In / Sign Up)      |
| GET    | `/login`           | Customer login form                   |
| POST   | `/login`           | Authenticate customer                 |
| GET    | `/register`        | Customer registration form            |
| POST   | `/register`        | Create new customer                   |
| GET    | `/recovery`        | Password recovery form                |
| POST   | `/recovery`        | Verify identity for recovery          |
| POST   | `/update-password` | Reset password after verification     |

### Customer Routes (Session Required)
| Method | Route              | Description                           |
|--------|--------------------|---------------------------------------|
| GET    | `/`                | Customer dashboard                    |
| GET    | `/logout`          | Destroy session, redirect to landing  |
| GET    | `/profile`         | View profile details                  |
| POST   | `/profile`         | Update profile (requires password)    |
| GET    | `/acc_o_o`         | Account creation form                 |
| POST   | `/acc_o_o`         | Submit account application            |
| POST   | `/get_bal`         | Fetch account details (AJAX/JSON)     |
| POST   | `/with_draw`       | Withdraw funds                        |
| POST   | `/deposit`         | Deposit funds                         |
| POST   | `/validatepass`    | Validate password (AJAX)              |
| GET    | `/trans_history`   | Transaction history                   |
| GET    | `/applyloan`       | Loan application form                 |
| POST   | `/apply-loan`      | Submit loan application               |
| GET    | `/help`            | Help/FAQ page                         |

### Admin Routes (Admin Session Required)
| Method | Route                      | Description                            |
|--------|----------------------------|----------------------------------------|
| GET    | `/admlog`                  | Admin login form                       |
| POST   | `/admin-dashboard`         | Authenticate admin                     |
| GET    | `/admlogout`               | Admin logout                           |
| GET    | `/viewusers`               | View all registered customers          |
| GET    | `/approveorreject`         | View pending account applications      |
| POST   | `/approveaccounts`         | Approve or reject an account           |
| GET    | `/deactivateaccount`       | View active accounts for deactivation  |
| POST   | `/deactivateaccount`       | Deactivate an account                  |
| GET    | `/viewtrans`               | View all transactions                  |
| GET    | `/toreverseviewtrans`      | View reversible transactions           |
| POST   | `/reversetrans`            | Reverse a transaction                  |
| GET    | `/viewloans`               | View all loan applications             |
| GET    | `/viewactiveloans`         | View approved loans only               |
| GET    | `/approve-loans`           | View pending loans for approval        |
| POST   | `/approve-loans`           | Approve or reject a loan               |

---

## Database Design

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   customer   │       │     account      │       │  transactions    │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ customer_id  │──┐    │ Account_no  (PK) │──┐    │ id          (PK) │
│ name         │  │    │ Account_type     │  │    │ customer_id (FK) │
│ Email        │  ├───▶│ customer_id (FK) │  ├───▶│ Account_no  (FK) │
│ phone_number │  │    │ Branch_id        │  │    │ amount           │
│ dateofbirth  │  │    │ Balance          │  │    │ transaction_type │
│ address      │  │    │ status           │  │    │ status           │
│ city         │  │    │ created_at       │  │    │ created_at       │
│ state        │  │    └──────────────────┘  │    └──────────────────┘
│ pincode      │  │                          │
│ password     │  │    ┌──────────────────┐  │    ┌──────────────────┐
└──────────────┘  │    │loan_applications │  │    │     admin        │
                  │    ├──────────────────┤  │    ├──────────────────┤
                  │    │ loan_id     (PK) │  │    │ id          (PK) │
                  ├───▶│ customer_id (FK) │  │    │ username         │
                       │ account_no  (FK) │◀─┘    │ password         │
                       │ nmi              │       └──────────────────┘
                       │ emi              │
                       │ loanAmount       │
                       │ tenure           │
                       │ interest         │
                       │ repayment        │
                       │ status           │
                       └──────────────────┘
```

### Key Relationships
- **customer → account**: One-to-many (a customer can have multiple accounts)
- **customer → transactions**: One-to-many (via customer_id)
- **account → transactions**: One-to-many (via Account_no)
- **customer → loan_applications**: One-to-many
- **account → loan_applications**: One-to-many (loan is tied to an account)

---

## Authentication & Security

- **Password Hashing** — All passwords (customer + admin) are hashed with `bcrypt` (salt rounds: 10)
- **Session Management** — `express-session` with a configurable secret; sessions stored in-memory (server default)
- **Transaction Authentication** — Withdrawals and deposits require password re-verification
- **Profile Update Guard** — Profile edits require current password confirmation
- **Parameterized Queries** — All SQL queries use parameterized placeholders (`?`) to prevent SQL injection
- **Account Status Flow** — `pending → approved → inactive` lifecycle managed by admin

### Security Gaps (Honest Assessment)
- No route-level middleware guards (e.g., `isAuthenticated`, `isAdmin`) — session checks are done inline per handler
- Session secret should be a strong random string, not a simple value
- `cookie.secure` is set to `false` (appropriate for HTTP/dev, not production)
- No CSRF protection
- No rate limiting on login attempts
- Admin and customer sessions share the same session store without role separation

---

## Screenshots / Demo

> _Screenshots not yet available. To capture them, run the application locally and navigate through the customer and admin portals._

**Key pages to screenshot:**
1. Landing Page (`/dashboard`)
2. Customer Registration
3. Customer Dashboard (with accounts)
4. Loan Application Form
5. Admin Dashboard
6. Account Approval Panel
7. Transaction History

---

## Engineering Highlights

- **Database Transactions** — Withdrawals and reversals use `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK` for atomicity
- **Dual-Portal Architecture** — Clean separation between customer-facing and admin-facing workflows
- **Dynamic EMI Calculator** — Client-side cascading dropdowns (income range → EMI options → loan amount → auto-computed tenure/interest)
- **Transaction Audit Trail** — Both successful and failed transactions are recorded; reversals create negative-amount audit entries with "Reversed" status
- **Account Lifecycle** — Full status management: `pending → approved → inactive` with admin controls
- **Dark/Light Mode** — Implemented across multiple pages using CSS class toggling with smooth transitions
- **Loan Disbursement** — Approved loans automatically credit the associated account balance

---

## Limitations

1. **No route protection middleware** — Authentication checks are duplicated inline across handlers instead of using reusable middleware
2. **Flat file structure** — All templates, styles, and server files live in the root directory (no `views/`, `public/`, `routes/`, `controllers/` separation)
3. **Single handler file** — All ~1170 lines of business logic are in one `handler.js` file
4. **No input validation library** — Validation is manual and inconsistent across routes
5. **In-memory sessions** — Sessions are lost on server restart; not suitable for production
6. **No test coverage** — No unit or integration tests
7. **Hardcoded bank/branch data** — Bank and branch lists are hardcoded in the client-side template rather than stored in the database
8. **Missing `package.json` scripts** — No `start` or `dev` scripts defined
9. **DB import path mismatch** — `handler.js` imports `./dbcon/db` but `db.js` is in the root directory
10. **Nodemailer included but unused** — The `nodemailer` dependency is installed but never used in the code

---

## Future Improvements

These suggestions align with the current architecture and would be natural next steps:

1. **Restructure into MVC** — Separate into `models/`, `views/`, `controllers/`, `routes/`, `public/`, `middleware/`
2. **Add auth middleware** — Create `isAuthenticated` and `isAdmin` middleware functions for route protection
3. **Use a validation library** — Integrate `express-validator` or `joi` for consistent input validation
4. **Add `npm start` scripts** — Define `start` and `dev` scripts in `package.json`
5. **Persistent sessions** — Use `express-mysql-session` to store sessions in the database
6. **Implement fund transfers** — Account-to-account transfers between customers
7. **Email notifications** — Leverage the installed `nodemailer` for account approval/loan status notifications
8. **Add CSRF protection** — Use `csurf` middleware for form submissions
9. **Normalize bank/branch data** — Store banks and branches in database tables, serve via API
10. **Write tests** — Add integration tests for critical paths (auth, transactions, loan approval)
11. **Dockerize** — Add `Dockerfile` and `docker-compose.yml` for consistent dev/deploy environments

---

## License

No license file detected. Consider adding an [MIT License](https://choosealicense.com/licenses/mit/) or other appropriate open-source license.

---

## Additional Assessment

### Suggested Repository Description
> Full-stack banking application with customer and admin portals — built with Node.js, Express, EJS, and MySQL. Features account management, transactions, loan processing, and an admin dashboard.

### Suggested GitHub Topics
`nodejs`, `express`, `mysql`, `ejs`, `banking`, `fullstack`, `dbms-project`, `session-auth`, `crud`, `loan-management`

### Should the Repository Name Change?
The current name `bank-management-system` is **appropriate** and descriptive. No change needed.

### Worth Pinning on a Professional GitHub Profile?
**Conditionally.** It demonstrates competence with full-stack Node.js, relational database design, and multi-role workflows. However, the flat structure and single-file handler weaken the architectural impression. If restructured into proper MVC with route middleware, it would be a solid pin.

### Technical Strengths
- Complete end-to-end banking workflow (not just CRUD)
- Proper use of database transactions for financial operations
- Dual-portal (customer + admin) with distinct authentication
- Dynamic client-side loan calculator with cascading dependencies
- Transaction reversal with audit trail
- Dark/light theme support across the application

### Weaknesses / Outdated Patterns
- Monolithic `handler.js` (~1170 lines) — should be split into controllers
- No Express middleware for auth guards
- All files in root — no directory organization
- Callback-based MySQL queries (could use `async/await` with `mysql2/promise`)
- jQuery for AJAX in 2026 — `fetch()` is the modern standard
- No `.gitignore` visible (risk of committing `node_modules/` or `.env`)

### Recommended Refactors (Priority Order)
1. **Immediate**: Fix the `./dbcon/db` import path mismatch
2. **Immediate**: Add `.gitignore` with `node_modules/`, `.env`
3. **Immediate**: Add `"scripts": { "start": "node back.js", "dev": "nodemon back.js" }` to `package.json`
4. **Short-term**: Restructure into folders (`views/`, `public/`, `routes/`, `controllers/`, `config/`)
5. **Short-term**: Extract auth middleware from inline session checks
6. **Medium-term**: Migrate callbacks to `async/await` using `mysql2/promise`
