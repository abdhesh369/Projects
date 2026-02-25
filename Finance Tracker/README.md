# Finance Tracker

Finance Tracker is a comprehensive, full-stack personal finance management application designed to provide users with a clean, intuitive, and modern interface for overseeing their financial health. The architecture leverages a rich frontend powered by Next.js and a modular backend based on Node.js microservices.

## Features

- **Intuitive Dashboard:** A visually pleasing landing page providing an overview of your total balance, income, expenses, savings rate, and recent transactions.
- **Account Management:** Connect and manage bank accounts directly via **Plaid Integration**. Track the balance of checking, savings, credit, and investment accounts in one place.
- **Transaction History:** Detailed lists of all your income, expenses, and transfers with robust filtering and sorting capabilities.
- **Reporting & Analytics:** Interactive charts and robust insights built using Recharts for an engaging breakdown of your finances, including Income vs. Expenses and Category breakdowns.
- **Budgets and Goals:** Track spending across various categories against custom monthly or weekly budgets. Set and track personalized financial goals with progress indicators.
- **Secure Authentication:** User accounts are protected using JWT-based authentication combined with Multi-Factor Authentication (MFA) capabilities.
- **Responsive & Modern Design:** Styled with customizable CSS modules optimized for responsive dark and light modes, ensuring a seamless experience across desktop and mobile devices.

## Project Structure & Architecture

The project follows a monorepo-style structure, housing both the frontend and backend services, along with shared configurations and infrastructure deployments.

```
Finance Tracker/
├── backend/                  # Node.js/Express Microservices
│   ├── account-service       # Port 3002: Manages user bank accounts
│   ├── analytics-service     # Port 3003: Handles complex data analysis
│   ├── api-gateway           # Port 5000: Routes frontend requests to microservices
│   ├── audit-service         # Port 3004: Logs system events and user actions
│   ├── auth-service          # Port 3001: Handles JWT login, registration, MFA
│   ├── banking-integration-service # Port 3005: Plaid API interactions
│   ├── budget-service        # Port 3006: Manages budget limits and tracking
│   ├── notification-service  # Port 3007: In-app and email notifications
│   ├── reporting-service     # Port 3008: Generates data for dashboard charts
│   ├── transaction-service   # Port 3009: Handles income, expenses, transfers
│   └── user-service          # Port 3010: Manages user profiles and preferences
├── frontend/                 # React/Next.js Application
│   └── web-app/              # Next.js Pages router frontend
├── shared/                   # Shared types, utilities, or configurations
├── infrastructure/           # Deployment scripts (e.g., Kubernetes, Terraform)
├── database/                 # Database initialization scripts and migrations
└── docker-compose.yml        # Orchestration for local development
```

### Frontend (`frontend/web-app`)
Built to be fast and responsive, utilizing modern React ecosystems.
- **Framework:** Next.js 14 (Pages router) for routing and React page composition.
- **UI & State:** React DOM 18 and React Hooks. Context API for global state (Theme, Auth).
- **Data Fetching & Binding:** Axios for communicating with the backend APIs via standard REST calls.
- **Visuals:** Custom CSS modules (`.module.css`), SVG icons from `@heroicons/react`, and dynamic data visualization using `recharts`.
- **Forms & Validation:** Built using `react-hook-form` alongside `zod` to enforce strict schema validation on the client side.
- **Banking Integration:** Uses `react-plaid-link` to establish secure connections with users' banking institutions.

### Backend (`backend/`)
The backend is built around a highly scalable microservices architecture utilizing Node.js and Express. Each service runs independently and manages its own domain logic.
- **API Gateway:** Centralized entry point on Port 5000 that proxies requests to the appropriate underlying microservice.
- **Database:** Relies on **PostgreSQL** (interfaced through the `pg` package).
- **Security:** Secured via `helmet`, CORS setup, and JSON Web Tokens (`jsonwebtoken`).

#### Security Architecture
- **Internal Firewall (Issue #7)**: In a production environment, all microservices except the `api-gateway` MUST be locked down to only accept traffic from the internal VPC/Docker network. They should NOT be exposed to the public internet.
- **Service-to-Service Auth**: Microservices verify requests either via a shared `INTERNAL_SERVICE_TOKEN` passed in the `x-internal-token` header (for internal syncs/calls) or by validating JWTs issued by the `auth-service`.
- **Entropy Requirement**: All `JWT_SECRET` and `REFRESH_TOKEN_SECRET` values must be at least 32 characters long to ensure cryptographic strength.
- **Fail-Safe Config**: Services like `user-service` and `auth-service` are designed to "Fail-Fast" and exit if required secrets or integration keys (like Stripe) are missing or set to insecure placeholders.

## Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database running locally or remotely
- Active developer accounts for associated integrations (e.g., Plaid API keys)
- Docker & Docker Compose (optional, for containerized local development)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies for services:**
   You will need to install npm packages for each individual microservice.
   ```bash
   # Example for user-service
   cd user-service
   npm install
   ```
   *(Repeat for other necessary services like auth-service, transaction-service, etc.)*

3. **Configure Environment Variables:**
   Set up `.env` files inside each service folder referring to your PostgreSQL endpoint and secret keys. A typical `.env` file should include:
   ```env
   PORT=3003
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=finance_tracker
   JWT_SECRET=your_super_secret_key
   ```

4. **Start the backend:**
   You can start individual services using standard scripts:
   ```bash
   npm run dev
   ```
   Alternatively, root-level scripts like `node start-all.js` can be used to boot multiple services simultaneously.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/web-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` based on required API endpoints. For example:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000  # Pointing to the API Gateway
   NEXT_PUBLIC_PLAID_ENV=sandbox
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000` to begin using the Finance Tracker.

## Deployment Using Docker (Optional)

For a simplified setup experience tailored to development, you can use the provided Docker Compose configuration to spin up the entire application stack, including the PostgreSQL database.

```bash
docker-compose up --build
```
This command builds the images for all backend microservices, the frontend web application, and initializes the database container, linking them logically through an internal Docker network.

---

*Built with security and scalability in mind, Finance Tracker represents a modern standard for modular financial tools. Refer to the codebase for production deployment specifications.*
