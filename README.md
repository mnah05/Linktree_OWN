# LinkHub

Minimal link aggregation app (Linktree-style) with a Supabase-inspired dark UI theme.  
Users can sign up, log in, manage a profile (bio + up to 3 links), and share a public page.

## Tech Stack

- Node.js + Express
- TypeScript (server)
- Vanilla HTML / Tailwind (CDN) + small custom CSS design system
- Axios (client HTTP)
- JWT auth (Bearer tokens)
- (Models assume a persistence layer; not shown here)

## Project Structure (relevant)

```
apps/
  client/
    server.html                # Landing page
    public/
      pages/
        auth.html              # Login / Signup
        user.admin.html        # Authenticated profile manager
        dashboard.html         # Public profile (dynamic)
        error.404.html
      js/
        auth.script.js
        user.admin.js
        dashboard.js
  server/
    src/
      server.ts
      routes/
        auth.route.ts
        admin.route.ts
        profile.route.ts
      middleware/
        jwtVerify.middleware.ts
      model/
        auth.model.ts
        profile.model.ts
```

## Supabase-Inspired Theme

All pages share a dark palette with green accent:

```
--color-bg: #0f1115;
--color-surface: #1c1f26;
--color-surface-alt: #181c22;
--color-border: #232a33;
--color-text: #f1f5f9;
--color-text-dim: #94a3b8;
--color-accent: #3ecf8e;
--color-accent-hover: #32b176;
```

Utility patterns:

- Consistent border radius (14–18px)
- Subtle shadows
- Minimal motion (short fade/slide)
- Accessible focus ring: layered outline with accent

## Pages

| Page           | Path              | Purpose                                    |
| -------------- | ----------------- | ------------------------------------------ |
| Landing        | `/`               | Marketing / CTA to auth                    |
| Auth           | `/auth/`          | Sign In / Sign Up (tabbed)                 |
| Admin          | `/admin/`         | Manage bio + links (JWT required for save) |
| Public Profile | `/u/:username`    | Public view of user profile                |
| 404            | `/404` + fallback | Unified error page                         |

## Authentication Flow

1. User signs up or logs in at `/auth/`.
2. Server returns a JWT (must include `username`).
3. Client stores token in `localStorage` under key: `token` (legacy `jwtToken` still auto-normalized).
4. Admin page:
   - Loads without token => redirected to `/auth/`.
   - Pings `/admin/ping` with `Authorization: Bearer <token>`.
   - On success, username auto-filled (read-only).
5. Profile save calls `POST /admin/save` (protected).
6. Public profile fetch uses `/u/:username` (not protected).

## Token Notes

- Accepted header: `Authorization: Bearer <token>`
- Server middleware (`verifyJWT`) strips any case-insensitive `Bearer` prefix.
- Rejects empty / malformed / expired tokens with:
  - 401: missing / malformed
  - 403: invalid / expired

## API Endpoints (high-level)

| Method | Endpoint       | Auth | Description                                            |
| ------ | -------------- | ---- | ------------------------------------------------------ |
| POST   | `/auth/signup` | No   | Register user, returns token                           |
| POST   | `/auth/login`  | No   | Authenticate, returns token                            |
| GET    | `/admin/ping`  | Yes  | Validates token, returns `{ ok, username }`            |
| POST   | `/admin/save`  | Yes  | Save bio + links                                       |
| GET    | `/u/:username` | No   | Public profile JSON / HTML (depends on implementation) |

Success (save):

```
200 { "message": "Profile saved successfully" }
```

Errors:

```
401 { "error": "Unauthorized" }
403 { "error": "Invalid or expired token" }
404 { "error": "User not found" }
400 { "error": "Links must be an array" }
```

## Environment Variables

```
JWT_SECRET=your-secret
PORT=5500
```

## Running

```
pnpm install (or npm/yarn)
pnpm dev / npm run dev (if scripts configured)
node dist/server.js (after build) or ts-node src/server.ts
```

Visit:

- http://localhost:5500/
- http://localhost:5500/auth/
- http://localhost:5500/admin/ (after login)

## Front-End Scripts Summary

- auth.script.js:
  - Stores token as `localStorage.setItem("token", token)`
  - Handles login/signup tab switching
- user.admin.js:
  - Normalizes legacy `jwtToken`
  - Pings `/admin/ping` before enabling form
  - Auto-fills username from JWT payload
  - Validates link URLs (adds https:// if missing)
- dashboard.js:
  - Fetches and renders public profile (not shown here, assumed)

## Recent Fixes / Changes

- Consolidated token key (`token`) with backward compatibility.
- Added `/admin/ping` for lightweight auth validation.
- Hardened JWT parsing & error responses.
- Removed duplicated HTML blocks in `user.admin.html` and `error.404.html`.
- Unified theme across all pages.
- Added graceful redirect logic + reduced risk of infinite loops.
- Improved form UX: subtle transitions, accessible focus states.

## Troubleshooting

| Symptom                       | Cause                  | Fix                                |
| ----------------------------- | ---------------------- | ---------------------------------- |
| Redirect back to auth on save | Missing/expired token  | Re-login; check localStorage key   |
| 403 on `/admin/save`          | Bad/expired JWT        | Regenerate via login               |
| Username input editable       | Token missing username | Ensure server signs `{ username }` |
| Links not saving              | Invalid URL format     | Use full URL or valid domain       |
| UI inconsistent               | Old cached page        | Hard refresh / disable cache       |

## Extending

Ideas:

- Add drag-and-drop link ordering
- Support unlimited links with pagination / collapse
- Add avatar upload (S3 / Cloud Storage)
- Rate limit auth endpoints
- Extract shared theme into a global CSS file
- Replace Tailwind CDN with build pipeline

## License

MIT (adjust if needed)

---

Feel free to open issues for enhancements.
