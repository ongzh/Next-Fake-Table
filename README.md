# Next-Fake-Table

Fake OpenTable project using Full Stack Next.js, TypeScript, MySQL, TailWind CSS, Prisma ORM. Based on Next.js udemy tutorial.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Start the database:

```bash
docker compose up -d
```

Load Schema:

```bash
npx prisma migrate dev --name init
```

Start the server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
