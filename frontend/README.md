# Online Skill Certification Platform Frontend

This React frontend is designed to work directly with the backend in the `backend/` folder.

## Tech Stack

- React with hooks
- React Router
- Axios
- Context API for authentication
- Custom responsive CSS

## Setup

1. Open a terminal in the `frontend` folder.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example`.
4. Make sure the backend is running on `http://localhost:5000`.
5. Start the frontend:

```bash
npm run dev
```

## Notes

- JWT tokens are stored in `localStorage`.
- Protected requests automatically send:

```text
Authorization: Bearer <token>
```

- The admin course edit flow asks admins to reselect correct answers before saving because the backend intentionally hides correct answers in course read endpoints.

## Build for Production

```bash
npm run build
```
