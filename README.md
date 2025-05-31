# Language Story App Backend

A Node.js backend API for a language learning application that allows users to save stories and vocabulary in multiple languages.

## Technologies

- Node.js with Express
- TypeScript
- PostgreSQL with Sequelize ORM
- JWT Authentication
- RESTful API design

## Features

- 🔐 User authentication (register/login)
- 👤 User profile management with coin system
- 📖 Story management for multiple languages
- 🧠 Vocabulary management for multiple languages
- 🔄 Multi-language support

## Project Structure

```
src/
├── config/        # Database and configuration files
├── controllers/   # Route controllers
├── middleware/    # Custom middleware functions
├── models/        # Database models
├── routes/        # API routes
├── scripts/       # Utility scripts
├── types/         # TypeScript interfaces and types
└── server.ts      # Main application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure PostgreSQL:

   The application is configured to use a PostgreSQL database. You'll need to:

   - Install PostgreSQL if you haven't already:
     ```bash
     # Ubuntu
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     
     # Start PostgreSQL service
     sudo service postgresql start
     ```

   - Create a user and database:
     ```bash
     # Login to PostgreSQL as the postgres user
     sudo -u postgres psql
     
     # Inside psql, create a user (replace 'username' with your preferred username)
     CREATE USER username WITH PASSWORD 'your_password';
     
     # Create the database
     CREATE DATABASE language_story_app;
     
     # Grant privileges to the user
     GRANT ALL PRIVILEGES ON DATABASE language_story_app TO username;
     
     # Exit psql
     \q
     ```

3. Configure the environment:

   Create a `.env` file in the root directory with the following variables, matching your PostgreSQL setup:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=language_story_app
DB_USER=your_postgresql_username
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_jwt_secret_key_123
JWT_EXPIRES_IN=7d
```

4. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Testing the API

Once your server is running and connected to the database, you can use the built-in test script to verify all endpoints are working correctly:

```bash
npm run test-api
```

This script will:
1. Register a test user (or log in if already registered)
2. Test all API endpoints for user, stories, and words
3. Show detailed results for each operation

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  { "email": "user@example.com", "password": "yourpassword" }
  ```

- `POST /api/auth/login` - Login and get JWT token
  ```json
  { "email": "user@example.com", "password": "yourpassword" }
  ```
  
### User

- `GET /api/user/profile` - Get user profile (requires authentication)

- `PATCH /api/user/coin` - Update user coin amount (requires authentication)
  ```json
  { "coin": 100 }
  ```

### Stories

- `GET /api/stories/:language` - Get user stories for a language (requires authentication)

- `POST /api/stories/:language` - Save a story for a language (requires authentication)
  ```json
  {
    "title": "Story Title",
    "content": "Story content goes here...",
    "level": "beginner",
    "minutes": 5,
    "words": 250,
    "genre": "drama",
    "description": "A short description"
  }
  ```

- `DELETE /api/stories/:language/:storyId` - Delete a saved story (requires authentication)

### Words

- `GET /api/words/:language` - Get user words for a language (requires authentication)

- `POST /api/words/:language` - Save a word for a language (requires authentication)
  ```json
  { "word": "hello", "meaning": "a greeting used when meeting someone" }
  ```

- `DELETE /api/words/:language/:wordId` - Delete a saved word (requires authentication)

## Production Deployment

Build the project before deployment:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `sudo service postgresql status`
- Verify the credentials in your `.env` file match those you set up
- Check that the database exists: `psql -l` (Lists all available databases)
- Try connecting manually: `psql -U your_user -d language_story_app`

### API Authentication Issues

- Ensure you're including the JWT token in your requests:
  ```
  Authorization: Bearer your_jwt_token
  ```
- Check that the token has not expired (default: 7 days)
