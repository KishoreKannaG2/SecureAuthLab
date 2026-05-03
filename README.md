# SecureAuth Lab — Authentication Security Analysis System

A full-stack cybersecurity simulation platform demonstrating how brute-force attacks exploit weak authentication systems and how security mechanisms prevent them.

**Stack:** React 18 + Spring Boot 3 + MongoDB Atlas

---

## Architecture

```
React Frontend  →  Java Spring Boot (API)  →  MongoDB Atlas
                          ↑
                  Brute Force Module
```

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS  |
| Backend  | Java 17 + Spring Boot 3         |
| Database | MongoDB Atlas                   |
| Auth     | JWT + BCrypt                    |

---

## Project Structure

```
SecureAuthLab/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/api.js
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── src/main/java/com/secureauthlab/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── dto/
│   ├── src/main/resources/application.properties
│   └── pom.xml
│
└── README.md
```

---

## Quick Start

### Backend
```bash
cd backend
# Edit src/main/resources/application.properties with your MongoDB URI
mvn spring-boot:run
# Runs at http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint                 | Description              | Auth |
|--------|--------------------------|--------------------------|------|
| POST   | `/api/auth/login`        | Login, returns JWT       | No   |
| POST   | `/api/auth/logout`       | Logout                   | Yes  |
| GET    | `/api/monitor/stats`     | Dashboard stats          | Yes  |
| GET    | `/api/monitor/attempts`  | All login attempts       | Yes  |
| POST   | `/api/attack/start`      | Start brute force sim    | Yes  |
| GET    | `/api/attack/status`     | Live attack status       | Yes  |
| POST   | `/api/attack/stop`       | Stop simulation          | Yes  |
| GET    | `/api/security/config`   | Get security settings    | Yes  |
| PUT    | `/api/security/config`   | Update security settings | Yes  |

---

## Security Features

- BCrypt password hashing
- JWT stateless auth
- Account lockout after N failed attempts (configurable)
- 60-second countdown timer in UI
- All login attempts logged to MongoDB
- CORS protection

---

## Default Admin Credentials (Dev Only)

```
Username: admin
Password: Admin@1234
```

---

## Educational Demo Flow

1. Login with admin credentials
2. Go to Attack Simulation — run attack on weak password, watch it crack
3. Enable lockout in Security Settings
4. Run attack again — gets blocked after 5 attempts
5. View Logs — see every attempt with timestamp and IP
