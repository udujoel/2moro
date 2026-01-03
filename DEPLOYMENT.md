# 2moro Deployment Guide (Vercel + Postgres)

This guide will help you deploy **2moro** to Vercel and set up the PostgreSQL database for persistence.

## 1. Prerequisites
- A [Vercel](https://vercel.com) account.
- This project pushed to a Git repository (GitHub, GitLab, etc.).

## 2. Deploy to Vercel
1.  Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
2.  Import your **2moro** repository.
3.  In the **Configure Project** screen:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Install Command**: `npm install` (default).
4.  Click **Deploy**. (The first build might fail if the DB isn't connected yet, that's okay!)

## 3. Set Up Storage (Postgres)
1.  Once the project is created (or while it's building), go to the **Storage** tab in your Vercel Project Dashboard.
2.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
3.  Accept the terms and click **Create**.
4.  Select a Region (choose one close to you).
5.  Click **Connect**.
6.  Vercel will automatically add the necessary Environment Variables (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.) to your project.

## 4. Update Environment Variables for Prisma
Vercel provides `POSTGRES_PRISMA_URL` but Prisma expects `DATABASE_URL` by default. You can map them easily:

1.  Go to **Settings** -> **Environment Variables**.
2.  Find `POSTGRES_PRISMA_URL` (it should be there from step 3).
3.  Add a **New Variable**:
    *   **Key**: `DATABASE_URL`
    *   **Value**: Copy the value from `POSTGRES_PRISMA_URL` and paste it here.
4.  **Important**: If you are using valid connection pooling, you might want `POSTGRES_PRISMA_URL`. For standard setup, standard URL works.

## 5. Redeploy and Migrate
1.  Go to the **Deployments** tab.
2.  Click the **three dots** on the latest deployment -> **Redeploy**.
3.  **Database Migration**:
    *   Vercel usually doesn't run `prisma migrate` automatically during build unless configured.
    *   **Option A (Recommended for First Run)**:
        *   Install the Vercel CLI locally: `npm i -g vercel`.
        *   Link your project: `vercel link`.
        *   Pull env vars: `vercel env pull .env.local`.
        *   Run migration locally pointing to the cloud DB: `npx prisma migrate deploy`.
    *   **Option B (Build Script)**:
        *   Update `package.json` build script to: `"build": "prisma generate && prisma migrate deploy && next build"`.
        *   This ensures the DB is always up to date on every deploy.

## 6. Local Development
To develop locally with the cloud database:
1.  Run `vercel env pull .env.local` to get the connection strings.
2.  Run `npm run dev`.
3.  The app will now use the Vercel Postgres instance!
