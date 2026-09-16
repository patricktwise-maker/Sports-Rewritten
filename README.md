# Sports Rewritten

**The Home of the Sports Multiverse**

Version 1 foundation for the Sports Rewritten subscription sports publication.

## Current checkpoint

- Responsive homepage shell
- Sports Rewritten brand treatment
- Featured Joe Hamilton timeline
- Article-card system
- Browse-by-sport section
- Reader poll UI
- Dynasty Architect companion promo
- Vault and founding membership sections
- Full prototype article route
- Metadata foundation for later SEO/Discover work
- Contributor Studio with Supabase authentication
- Cloud article drafts and section storage
- Contributor approval workflow
- Hero-image storage
- Editorial review status flow

## Routes

- `/`
- `/studio`
- `/college-football/what-if-joe-hamilton-was-born-20-years-later`

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Backend

Sports Rewritten uses a dedicated Supabase project for authentication, contributor profiles, article drafts, article sections, editorial workflow, and article media storage. Vercel environment variables provide the public Supabase project URL and publishable key to the deployed Next.js application.

## Still to come

Stripe subscriptions, reader search, analytics, publishing administration, live voting, and additional editorial tools belong to later milestones.
