# Backend (Express + TypeScript + Prisma)

Production-ready backend inferred from the existing Next.js frontend behavior.

## Folder Structure

```txt
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
      env.ts
    lib/
      prisma.ts
    middleware/
      auth.ts
      error-handler.ts
      validate.ts
    modules/
      auth/
      courses/
      enrollments/
      admin/
    types/
      express.ts
    utils/
      http-error.ts
      jwt.ts
    app.ts
    server.ts
  tests/
    health.test.ts
  .env.example
  jest.config.ts
  tsconfig.json
```

## Database Schema

Implemented in `prisma/schema.prisma` with:

- `User` + `StudentProfile` (1-1)
- `Mentor` + `Course` (1-many)
- `Course` + `CourseModule` + `Lesson` (1-many chain)
- `User` + `Course` through `Enrollment` (many-many)
- `CourseReview` linked to both course and user
- `CourseTag` for searchable tags
- `Assignment` + `Submission` for homework lifecycle
- `Quiz` + `Question` + `QuizAttempt` for assessments
- `AdminPermission` for granular admin RBAC
- `Payment` for Egypt-friendly payment methods and verification workflow

## API Documentation

Base URL: `http://localhost:5000`

### Health
- `GET /health`
  - Response: `{ "status": "ok" }`

### Auth
- `POST /api/auth/register`
  - Body:
    - `firstName`, `secondName`, `thirdName`, `lastName`
    - `studentPhone`, `fatherPhone`, `motherPhone?`
    - `governorate`, `educationType`, `grade`, `department`
    - `email`, `password`, `confirmPassword`
  - Response: `{ user, accessToken }`

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ user, accessToken }`

- `GET /api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Response: `{ user }`

### Courses
- `GET /api/courses?featured=true`
  - Returns list of courses for `/courses` and featured cards on homepage.

- `GET /api/courses/:idOrSlug`
  - Returns full course details for `/courses/[id]`.

### Student Enrollments
- `GET /api/enrollments/me`
  - Auth required (student/admin token)
  - Returns current user enrolled courses.

- `POST /api/enrollments/:courseId`
  - Auth required
  - Enroll current user in course.

- `DELETE /api/enrollments/:courseId`
  - Auth required
  - Remove enrollment.

### LMS (Student/Admin/Super Admin)

- `GET /api/lms/student/dashboard` (role: `USER`)
- `GET /api/lms/courses/:courseId/learn` (role: `USER`)
- `POST /api/lms/assignments/:assignmentId/submissions` (role: `USER`)
- `POST /api/lms/quizzes/:quizId/attempts` (role: `USER`)
- `POST /api/lms/payments` (role: `USER`, create pending payment request)

- `POST /api/lms/admin/lessons` (role: `ADMIN`/`SUPER_ADMIN`, requires `canManageContent`)
- `POST /api/lms/admin/assignments` (role: `ADMIN`/`SUPER_ADMIN`, requires `canManageContent`)
- `POST /api/lms/admin/quizzes` (role: `ADMIN`/`SUPER_ADMIN`, requires `canManageContent`)
- `GET /api/lms/admin/payments` (role: `ADMIN`/`SUPER_ADMIN`, requires `canManagePayments`)
- `PATCH /api/lms/admin/payments/:paymentId` (role: `ADMIN`/`SUPER_ADMIN`, requires `canManagePayments`)

- `POST /api/lms/super-admin/admins` (role: `SUPER_ADMIN`)
- `PATCH /api/lms/super-admin/admins/:adminId/permissions` (role: `SUPER_ADMIN`)

### Admin (Legacy Admin Dashboard APIs)
All routes require `ADMIN` or `SUPER_ADMIN`.

- `GET /api/admin/dashboard/metrics`
  - Dashboard totals: courses, students, enrollments, rating, revenue.

- `GET /api/admin/students`
  - Student list with profile + enrolled course ids.

- `PATCH /api/admin/students/:studentId/enrollments`
  - Body: `{ enrolledCourseIds: string[] }`
  - Bulk overwrite student enrollments (for Manage Students modal behavior).

- `GET /api/admin/courses`
  - Course list for admin manage courses page.

- `PATCH /api/admin/courses/:courseId`
  - Body (any subset): `{ title, tagline, price, level }`
  - Edits course card fields used in admin UI.

## Setup

1. Copy env file:
   - `cp .env.example .env` (or equivalent on Windows)
2. Configure PostgreSQL and update `DATABASE_URL`.
3. Run:
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate -- --name init`
   - `npm run prisma:seed`
4. Start development server:
   - `npm run dev`

Default seeded admin:
- Email: `admin@waleed.com`
- Password: `Admin@12345`

Important:
- Role enum now includes `USER`, `ADMIN`, `SUPER_ADMIN`.
- Existing databases from older schema require running a fresh migration.

## Frontend Integration Notes

- Replace localStorage-only login flow by calling `/api/auth/login` and storing token securely.
- Replace dummy-data usage with:
  - `/api/courses` + `/api/courses/:idOrSlug`
  - `/api/admin/*` for dashboard and management pages
  - `/api/enrollments/*` for student subscriptions
