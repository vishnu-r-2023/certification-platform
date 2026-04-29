# Online Skill Certification Platform Backend

This is a beginner-friendly, production-style backend built with Node.js, Express, MongoDB, and Mongoose.

## Features

- JWT authentication with `user` and `admin` roles
- Secure password hashing with bcrypt-compatible `bcryptjs`
- Course management APIs
- Quiz submission with automatic result calculation
- Certificate generation when a user passes a quiz
- MVC folder structure with centralized error handling

## Folder Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── .env.example
├── package.json
└── server.js
```

## Setup

1. Open a terminal inside the `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example`.
4. Update the MongoDB and JWT values in `.env`.
5. Start the server:

```bash
npm run dev
```

For normal production-style startup:

```bash
npm start
```

## Important Notes

- Regular users can register normally.
- To create an admin through the same register endpoint, send `role: "admin"` and the correct `adminSecret` from `.env`.
- Public course endpoints do not expose quiz correct answers.

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `POST /api/quiz/submit`
- `GET /api/certificate/:courseId`
