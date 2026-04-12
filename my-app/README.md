## Frontend Setup

This frontend is fully integrated with the Express/Prisma backend.

### 1) Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2) Run frontend

```bash
npm install
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000).

## Backend dependency

Make sure backend is running on port `5000`:

```bash
cd ../backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

## Implemented integration

- Real auth (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`) with JWT storage.
- Real courses (`/api/courses`, `/api/courses/:idOrSlug`).
- Real enrollments (`/api/enrollments/me`, `/api/enrollments/:courseId`).
- Real admin management (`/api/admin/*`) for dashboard/courses/students.
- Protected routes for admin pages and `my-courses`.
