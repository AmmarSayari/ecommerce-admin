# Ecommerce Admin

The administration dashboard and public API for the ecommerce storefront.

## Local development

1. Copy `.env.example` to `.env` and configure the services.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

Use the pooled Neon connection string for `DATABASE_URL`. Use the direct
connection string for `DIRECT_DATABASE_URL` when running migrations.

## Existing Neon database

The initial migration represents the existing database before relational
constraints were added. Before changing the old database:

1. Create a Neon backup or branch.
2. Run `npm run db:inspect` and confirm there are no orphaned records.
3. Mark the existing schema as the migration baseline:

```powershell
npx prisma migrate resolve --applied 20260720000000_init
```

4. Apply the follow-up migration:

```powershell
npm run db:deploy
```

Do not run the initial migration directly against the populated database
without first marking it as applied.

For a new empty database, run `npm run db:deploy` normally. Run
`npm run db:seed` only when demo data is wanted.

## Vercel

Configure these Production environment variables in the admin Vercel project:

```text
DATABASE_URL
DIRECT_DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
FRONTEND_STORE_URL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

`FRONTEND_STORE_URL` must be the deployed storefront origin. Configure Stripe
to send `checkout.session.completed` to:

```text
https://YOUR-ADMIN-DOMAIN/api/webhook
```

Use that endpoint's `whsec_...` signing secret for `STRIPE_WEBHOOK_SECRET`.
`CLOUDINARY_URL` and the seed variables are not required by the deployed app.

## Verification

```powershell
npm run db:inspect
npm run lint
npm run typecheck
npm run build
npm audit
```
