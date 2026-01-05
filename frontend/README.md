This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📦 Deployment Checklist (Production Ready)

### 1. Backend (Render)
- [ ] Connect your repository to **Render**.
- [ ] Create a **New Blueprint Instance** and select this repository.
- [ ] Render will detect the `.render.yaml` configuration.
- [ ] **Fill in the secrets** when prompted (marked as `sync: false`):
    - `DATABASE_URL`: Your Supabase connection string (Transaction Mode, Port 6543).
    - `MP_ACCESS_TOKEN`: Your Mercado Pago Access Token.
- [ ] Click **Apply Operations**. Render will deploy:
    - `drop-backend` (API Web Service)
    - `drop-payment-worker` (Background Worker for async payments)
    - `drop-redis` (Redis instance for the queue)

### 2. Frontend (Vercel)
- [ ] Import the `frontend` directory project to **Vercel**.
- [ ] Add the following **Environment Variables** in Vercel:
    - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://drop-backend-xyz.onrender.com/api`). **Important:** Get this URL from Render dashboard after deploy.
    - `NEXT_PUBLIC_FRONTEND_URL`: Your Vercel domain (e.g., `https://drop-store.vercel.app`).
    - `NEXT_PUBLIC_MP_ZERO_COST`: `true`
- [ ] Deploy.

### 3. Verification
- [ ] Access your site.
- [ ] Make a test purchase.
- [ ] Verify if the order is created and if the payment link appears (processed by the background worker).

**System Status:** `Custo 0`, `High Performance`, `AI Powered`, `Cloud Native`.
