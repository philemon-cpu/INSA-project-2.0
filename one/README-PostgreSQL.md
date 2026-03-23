# PostgreSQL Setup for INSA Project

## Overview
This project has been migrated from Firebase to PostgreSQL for user authentication and data storage.

## Prerequisites
1. PostgreSQL installed on your system
2. Node.js and npm installed

## Setup Instructions

### 1. Database Setup
```bash
# Create database
createdb insa_project

# Run the schema file to create tables
psql -d insa_project -f src/database-schema.sql
```

### 2. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:

```env
# PostgreSQL Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=insa_project
DB_PASSWORD=your_password_here
DB_PORT=5432

# React App Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Backend Server
```bash
node server.js
```

### 5. Start the React App
In a new terminal:
```bash
npm start
```

### 6. Use PostgreSQL Components
To use the PostgreSQL version instead of Firebase, update `src/index.js` to import `AppPostgres` instead of `App`:

```javascript
import AppPostgres from './AppPostgres';
// Instead of: import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <AppPostgres />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Database Schema
The database includes:
- `users` table: Stores user credentials and basic info
- `user_profiles` table: Extended user information (optional)

## API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/:id` - Get user by ID
- `GET /api/health` - Health check

## Files Created/Modified
- `src/database.js` - PostgreSQL connection configuration
- `src/auth.js` - Authentication functions using API
- `src/api.js` - API client functions
- `src/database-schema.sql` - Database schema
- `src/components/LoginPostgres.js` - PostgreSQL login component
- `src/components/SignupPostgres.js` - PostgreSQL signup component
- `src/AppPostgres.js` - Main app using PostgreSQL
- `server.js` - Express server with API endpoints
- `.env.example` - Updated with PostgreSQL variables

## Security Features
- Password hashing with bcryptjs
- Input validation
- Rate limiting on failed login attempts
- SQL injection prevention with parameterized queries
