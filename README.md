# TedPRM

A web-based application for managing personal and professional relationships, inspired by MonicaHQ. Built with Next.js, React, Tailwind CSS, and PostgreSQL.

## Features

- User authentication and account management
- Contact management
- Notes and interaction tracking
- Reminders for important events
- Search functionality
- Dark/light theme support
- Responsive design

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/tedprm.git
   cd tedprm
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/tedprm?schema=public"
   JWT_SECRET="your-secret-key"
   ```

4. Create the database schema:
   ```
   npx prisma migrate dev --name init
   ```

5. Generate Prisma client:
   ```
   npx prisma generate
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tedprm/
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── contacts/         # Contact pages
│   │   ├── reminders/        # Reminder pages
│   │   └── settings/         # User settings
│   ├── components/           # React components
│   ├── utils/                # Utility functions
│   └── styles/               # Global styles
├── .env                      # Environment variables
└── package.json              # Project dependencies
```

## Development

### API Endpoints

- `/api/auth/signup` - Create a new user account
- `/api/auth/login` - Log in to an existing account
- `/api/auth/reset-password` - Request a password reset
- `/api/contacts` - List and create contacts
- `/api/contacts/[id]` - Get, update, or delete a specific contact
- `/api/notes` - List and create notes
- `/api/notes/[id]` - Get, update, or delete a specific note
- `/api/reminders` - List and create reminders
- `/api/reminders/[id]` - Get, update, or delete a specific reminder
- `/api/search` - Search across contacts, notes, and reminders
- `/api/user` - Get or update user profile
- `/api/user/password` - Change password

### Environment Setup

The application supports three environments:

- `development` - Local development
- `test` - Testing environment
- `production` - Production deployment

Each environment can use a different database by setting the appropriate `DATABASE_URL` in the environment variables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspired by [MonicaHQ](https://www.monicahq.com/)
