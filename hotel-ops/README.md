# 🏨 HotelOps Live

A real-time hotel operations management dashboard built with Next.js, Shadcn UI, and Supabase.

## Features

- 🔴 Real-time room status tracking
- 📋 Staff task management  
- 🎯 Guest service portal
- 📊 Live activity feed
- 🏢 Multi-hotel support
- 🌓 Dark/Light mode

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **UI**: Shadcn UI + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Real-time)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account ([supabase.com](https://supabase.com))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
