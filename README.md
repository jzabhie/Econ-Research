# Econ Research - Academic Portal

A personal academic website for economics research, teaching, and student collaboration. Built with Next.js, SQLite, and Tailwind CSS.

## Features

### 📊 Research
- Showcase ongoing research papers, working code, and datasets
- Filter by category (Paper, Working Paper, Code, Data)
- Links to external resources and file downloads

### 📚 Teaching
- Course listings with descriptions, codes, and semesters
- Course materials with downloadable resources
- Organized by academic terms

### 📝 Notebook (Student Exam Portal)
- Interactive exam interface where students write and submit answers
- Time-limited access with countdown timer
- Access control — admin grants timed access to specific students
- Submission tracking and updates

### 🔐 Authentication & Access Control
- JWT-based login/registration system
- Role-based access (admin vs student)
- Time-limited access grants for exams and resources
- Admin dashboard for managing all content

### ⚙️ Admin Dashboard
- Add research items, courses, and exams
- Create exams with JSON-formatted questions
- Grant and revoke student access with expiration dates
- View all current access grants

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Seed the database with sample data and admin user
npm run seed

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the website.

### Default Admin Login
- **Email:** admin@econresearch.edu
- **Password:** admin123

> ⚠️ Change the admin password and JWT secret in production!

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Login, register, session
│   │   ├── research/     # Research CRUD
│   │   ├── courses/      # Course CRUD
│   │   ├── exams/        # Exam CRUD + submissions
│   │   └── admin/        # Access management
│   ├── admin/            # Admin dashboard page
│   ├── login/            # Login/register page
│   ├── notebook/         # Student exam notebook
│   ├── research/         # Public research listing
│   └── teaching/         # Public course listing
├── components/           # Shared UI components
├── lib/
│   ├── auth.ts           # Authentication utilities
│   └── db.ts             # Database setup and schema
scripts/
└── seed.ts               # Database seeding script
__tests__/                # Test files
data/                     # SQLite database (auto-created)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Testing:** Jest + ts-jest

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | dev-secret | Secret for JWT token signing |
| `DB_PATH` | `data/app.db` | Path to SQLite database file |

## Creating Exams

Exams use a JSON format for questions. Example:

```json
[
  {"id": 1, "text": "What is GDP?", "type": "essay"},
  {"id": 2, "text": "Explain supply and demand.", "type": "essay"}
]
```

## Access Control

To give a student access to an exam:

1. Go to Admin Dashboard → Access tab
2. Enter the student's User ID
3. Select resource type (exam, course, notebook)
4. Optionally set an expiration date
5. Click "Grant Access"

Students will only be able to submit answers to exams they have been granted access to (or when access hasn't expired).
