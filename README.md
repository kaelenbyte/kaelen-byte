# Kaelen Byte Official Website

A responsive, SEO-ready static website for Kaelen Byte built with React, TypeScript, Vite, Tailwind CSS, and React Router.

## Local development

```bash
export PATH="$HOME/.nodejs/bin:$PATH"
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

Set the site URL before launch:

```bash
VITE_SITE_URL=https://your-domain.com
```

## Scripts

```bash
npm run dev
npm run build
npm run preview -- --host 0.0.0.0
npm run lint
npm run test
npm run test:run
```

## Notes

- Brand name: Kaelen Byte
- Tagline: Explore. Create. Innovate.
- TikTok profile included: https://www.tiktok.com/@jaydendarius.me
- Other social links remain hidden until valid URLs are supplied.
- Contact email and final production domain are placeholders that should be replaced before launch.

## Deployment checklist

1. Replace the placeholder production domain in `src/config/site.ts`, `public/robots.txt`, and `public/sitemap.xml`.
2. Add the real website domain in Google Search Console.
3. Submit the sitemap and verify the homepage.
4. Confirm the social links and contact details are correct.
5. Finalize the biography, article content, and launch copy before publishing.

## Recommended hosting

This project is structured to deploy on Vercel or a similar static host.

## Manual actions still required before launch

- Real production domain
- Contact email address
- Any additional social profile URLs that are officially confirmed
- Final biography and content updates
- An owner-approved personal portrait, if one is wanted

## Photography

The owner-supplied portrait is stored at `public/images/kaelen-portrait.png` and used on the Home and About pages. The other locally stored images are Unsplash stock photos for technology and editorial content, not personal portraits:

- Creative workspace: https://images.unsplash.com/photo-1498050108023-c5249f4df085
- Collaborative technology: https://images.unsplash.com/photo-1519389950473-47ba0277781c
- Digital work: https://images.unsplash.com/photo-1461749280684-dccba630e2f6
- Technology detail: https://images.unsplash.com/photo-1518770660439-4636190af475

## Search readiness

- Canonical URLs should match the final production domain.
- Submit the sitemap to Google Search Console.
- Verify the homepage and request indexing only after the final domain is switched.
- Review metadata and structured data after deployment.
# kaelen-byte

## Community platform

The `/community` section is a Supabase-backed public social feature integrated
with the existing portfolio. It includes email/password registration and
recovery, profiles, public posts with optional images, cursor-paginated feed,
likes, comments, follows, saved posts, private notifications, reports, and a
moderator queue. Community data is not seeded into browser storage. The
portfolio remains available independently of Supabase configuration.

### Community technology

- React 19, TypeScript, Vite, Tailwind CSS, React Router
- Supabase Auth, PostgreSQL, Realtime and Storage
- TanStack Query for server state; React Hook Form + Zod for validation
- SQL migrations under `supabase/migrations/`

### Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

For local development, `npx supabase start` prints the local API URL and
publishable key; put those values in `.env`. For a hosted project, use its
Project URL and publishable key instead. The publishable/anon key is intended
for browser use; never put a service-role key, database password, or signing
secret in a `VITE_` variable.

### Database and storage setup

Install the Supabase CLI and authenticate, then link the project and apply the
versioned migrations:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Migrations create `profiles`, `posts`, `comments`, `likes`, `follows`,
`reports`, `notifications`, `saved_posts`, `user_blocks`, `moderation_actions`,
`user_roles`, and `posting_events`; they also establish constraints, indexes,
profile initialization, notification triggers, database rate limiting, RLS,
and the `avatars` / `post-images` storage buckets and policies. The browser
uploads images beneath `{authenticated-user-id}/{generated-name}`. Avatar size
is limited to 2 MB and post images to 5 MB; accepted MIME types are PNG, JPEG,
WEBP and GIF. Image URLs are public because community posts and profiles are
public content.

For an isolated local Supabase stack, run `npx supabase start`. It applies the
migrations and local seed. Use `npx supabase db reset` to recreate the local
database and reapply everything. `supabase/seed.sql` contains explicitly
labeled demo accounts and posts and should only be used locally. The demo
accounts use the password `password123`. Stop the local services with
`npx supabase stop`.

### Authentication and moderation setup

In Supabase Authentication settings, enable email/password sign-in, configure
email confirmation as desired, and add the local and production community
URLs to the allowed redirect URL list, including `/community/reset-password`.
Set the site URL to the deployed origin. Test both confirmation and password
recovery emails after configuration.

The migration intentionally does not create a moderator. Grant the first
administrator through a trusted operator/database session, not through a
browser request:

```sql
insert into public.user_roles (user_id, role)
values ('AUTH_USER_UUID', 'admin');
```

Afterward, the `grant-role` Edge Function can be deployed to allow admins to
grant/revoke moderator roles. Its service-role credential must only be set as
a Supabase Function secret. RLS protects report privacy and all ownership
operations independently of route guards.

Database triggers enforce per-account limits (10 posts per 10 minutes, 30
comments per 10 minutes, and 10 reports per hour); advisory transaction locks
serialize concurrent writes. These are basic abuse limits, not a complete
anti-abuse system. Browser file checks improve feedback but are not a
malware-scanning service; storage MIME/size policies are the enforced boundary.

### Testing and deployment

```bash
npm run test:run
npm run test:supabase
npm run lint
npm run build
npm run preview
```

`npm run test:supabase` is restricted to a localhost Supabase URL. It checks
registration/profile initialization, public reads, unauthenticated write
rejection, ownership and role protections, likes/comments/follows/saves,
counts, storage ownership, notification privacy, Realtime across two accounts,
and the database rate-limit function. It cleans up the temporary records it
creates. Unit/UI tests run without Supabase.

The static build outputs `dist`. Vite's SPA fallback works in development; for
Vercel, `vercel.json` rewrites nested application routes to `index.html`. For
other hosts, configure equivalent history fallback. Set production environment
variables in the hosting provider and configure Supabase auth redirect URLs
for the final HTTPS domain before release.

### Known limitations

- The local Supabase backend and migrations have been exercised. A hosted
  Supabase project still needs its own credentials, auth redirect configuration,
  email delivery setup, and production migration deployment.
- The `grant-role` Edge Function is present but was not exercised in this local
  Docker environment; test and deploy it in the target Supabase project before
  using it for moderator administration. Initial admin assignment remains a
  trusted operator task.
- Image bytes are checked by browser MIME and Supabase Storage bucket limits;
  there is no server-side malware scanning or image transcoding.
- Following feed is bounded to the latest 50 followed-user posts; public feed
  uses stable `(created_at, id)` cursor pagination.
- Reports support post/comment/profile target types, while moderator removal
  currently supports posts and comments. Profile reports can be reviewed but
  do not disable accounts.
- Notifications are persisted for likes, comments, and follows; moderation
  notifications are not generated.
- Profile header image storage is present in the schema but does not yet have a
  settings upload control. Comment editing is supported by the service layer
  and ownership policy but is not exposed in the current interface.
