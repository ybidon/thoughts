# Thoughts

A minimalist web application for archiving and sharing thoughts. Built with Next.js, Prisma, and Neon DB.

## Features

- Write and archive thoughts
- Automatic timestamp for each thought
- Real-time updates
- Persistent storage with Neon DB
- Clean, minimalist UI

## Tech Stack

- Next.js 15.2
- TypeScript
- Prisma ORM
- Neon (Serverless Postgres)
- Tailwind CSS
- Vercel Hosting

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your database credentials
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The app is automatically deployed to Vercel. Each push to the main branch triggers a new deployment.

Live at: [yassinewrites.vercel.app](https://yassinewrites.vercel.app)
