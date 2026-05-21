# 🖥️ Primetrade REST API (Backend Console)

**🟢 Live Demo (Deployed):** [Click here to open the live website](https://primetrade-frontend-r5vs.onrender.com/login)

<h3 align="center">
  <span style="color:red;">⚡ Use the built-in autofill buttons on the login screen for instant access!</span>
</h3>

This directory contains the production-ready Node/Express backend application.

---

## 🛠️ Project Structure
```
backend/
├── docs/                   # API Specifications
│   ├── swagger.yaml        # OpenAPI v3.1 specification
│   └── primetrade-...json  # Postman test collection
├── prisma/                 # Database ORM
│   ├── schema.prisma       # Database design (User, Task, Enums)
│   └── seed.js             # Initial database seeding script
├── src/
│   ├── config/             # Config variables, logger, database client
│   ├── middleware/         # Security, rate limiter, errors, RBAC guards
│   ├── modules/            # Domain logic modules
│   │   ├── auth/           # Login, register, cookies refresh
│   │   ├── tasks/          # CRUD Tasks logic
│   │   └── users/          # Admin-only user management
│   │
│   ├── utils/              # Base response and Error utilities
│   ├── app.js              # Express app definition
│   └── server.js           # Server listen port & unhandled errors hook
├── .env.example
├── Dockerfile
└── package.json
```

---

## 🛡️ Middlewares Configured
- **`auth.js`**: Restricts endpoints to logged-in users. Verifies Bearer JWT token signature.
- **`authorize.js`**: RBAC guard matching the decoded JWT payload role attribute (e.g. `ADMIN`, `USER`).
- **`validate.js`**: Validates request parameters, queries, or body structures before execution using Zod.
- **`errorHandler.js`**: Standardizes error objects into custom JSON format (`ApiError`) and masks server logs in production.
- **`rateLimiter.js`**: Standard limits via Express Rate Limit to prevent DDoS/brute forcing.

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Modify `DATABASE_URL` with your local PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/primetrade_db"
   ```
3. **Database Initialization & Seed**:
   Run schema updates and seed users:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   - API Server: `http://localhost:5000`
   - Swagger UI: `http://localhost:5000/api-docs`

---

## 🗄️ Database Seeding

The database seeding generates two main administrative profiles with several dummy tasks:
- **Admin**: `admin@primetrade.ai` (Password: `Admin@123`)
- **Regular User**: `user@primetrade.ai` (Password: `User@123`)
These accounts are immediately active for logging in via the Postman collection or Swagger console.

---

## 📈 Scalability & Production Readiness Note

This architecture is designed to scale horizontally in production environments:
1. **Stateless Authentication**: JWT tokens are used for authentication. Because sessions are not stored in memory, the API can be deployed across multiple instances behind a **Load Balancer** (e.g., Nginx, AWS ALB) without sticky sessions.
2. **Database Connection Pooling**: In production with PostgreSQL, tools like **PgBouncer** or Prisma Accelerate can be used to manage high concurrent database connections.
3. **Caching Layer (Future scope)**: For high-read endpoints (like fetching tasks), a **Redis** cache layer could be easily integrated into the existing modular architecture to reduce database load.
4. **Microservices Transition**: The codebase is strictly modular (`modules/auth`, `modules/tasks`). If the task management feature scales massively, the `tasks` module can be detached into its own microservice with minimal refactoring.
5. **Containerization**: A `Dockerfile` is included for immediate containerization, allowing orchestrators like Kubernetes or Docker Swarm to manage auto-scaling pods.
