# Setup

## 1. Assets that were deliberately left out

A few image files were removed from this template rather than genericized, since a placeholder
image would just be one more thing to notice and replace anyway. You need to supply these before
the app looks right (it will run without them, just with a few broken images):

| File | Used for | Notes |
|---|---|---|
| `web/public/logo.png` | Header logo, app icon source | Any square-ish image works |
| `web/assets/icon.png` | Capacitor app icon source | Only needed if you build the mobile app |
| `web/assets/splash.png` | Capacitor splash screen source | Only needed if you build the mobile app |

If you don't have Capacitor icon/splash assets ready yet, [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets)
can generate the full native icon/splash set from one source image once you add `logo.png`.

## 2. Install and configure

```bash
cd web
npm install
cp .env.example .env.local
```

Then pick one of the two setups below.

### Option A — a real Firebase project (recommended default; works for everyone, no extra installs)

1. Create a Firebase project (the free Spark plan is enough) at
   [console.firebase.google.com](https://console.firebase.google.com).
2. Enable Email/Password sign-in — Authentication → Sign-in method.
3. In `web/.env.local`, set `VITE_USE_FIREBASE_EMULATOR=false` and fill in the rest from your
   project's Project settings → General → Your apps → SDK setup and configuration. A Formspree
   endpoint and Cloud Messaging VAPID key are optional (feedback form / event-cancellation push
   notifications).
4. Deploy Firestore rules, indexes, and storage rules:
   ```bash
   firebase use --add
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

### Option B — the Firebase Local Emulator Suite (fully offline, no cloud project at all)

Requires a Java Runtime on your machine (the Firestore/Storage emulators run on it — Auth's alone
doesn't, but this app needs Firestore too). If you don't have Java and don't want to install it,
use Option A instead — it's not a lesser path, just a different one.

1. Install Java if you don't have it (e.g. `brew install openjdk` on macOS), then confirm with
   `java -version`.
2. Leave `web/.env.local` as-is — its placeholder `demo-*` values and
   `VITE_USE_FIREBASE_EMULATOR=true` already match this path, no editing needed.
3. Run the emulators (separate terminal from `npm run dev`):
   ```bash
   firebase emulators:start
   ```
   The Emulator UI is at `http://127.0.0.1:4000`. Data resets every time you stop the emulators
   unless you add `--export-on-exit` / `--import`.

## 3. Bootstrap the first Pastor account

Once your backend (real or emulated) is up:

- Sign up once through `/iniciar-sesion` (creates your `users/{uid}` doc, defaulting to the
  lowest-privilege role — nobody can self-assign a higher one).
- In the Firestore console, open that document and change `role` to `admin`.
- That account can then manage everyone else's role from `/administracion`.

**Seed ministries.** The `ministries` collection auto-seeds a few starter ministries the first
time a Pastor loads the app (see `src/lib/seedMinistries.ts`) — rename/add to them from the admin
panel afterward.

## 4. Local development

```bash
cd web
npm run dev      # start the dev server
npm run build    # type-check + production build
```

The app's root route (`/`) redirects straight to `/calendario`.

## 5. Embedding this in an existing church website

Two ways to combine this with a site that isn't built on this same codebase:

- **Link out:** point a nav link (e.g. "Events") at wherever you deploy this app.
- **Same Firebase project:** if your main site already uses Firebase Hosting, you can deploy this
  under a different hosting site/target in the same project and share the same Firestore
  `users`/`ministries` collections, so a visitor's account works across both.

## Project structure

```
church-calendar-template/
├── firebase.json / firestore.rules / firestore.indexes.json / storage.rules
└── web/
    └── src/
        ├── types/models.ts          # AppUser, Ministry, CalendarEvent, Rsvp
        ├── firebase/config.ts       # Firebase SDK init (reads web/.env.local)
        ├── contexts/AuthContext.tsx # tracks Firebase Auth user + Firestore user doc
        ├── hooks/usePermissions.ts
        ├── components/
        │   ├── calendar/             # CalendarView, EventFormModal, EventDetailsModal, etc.
        │   ├── admin/                # role/ministry management (RoleManagementPage)
        │   └── layout/               # minimal SiteHeader, route guards
        └── pages/
            ├── CalendarPage.tsx      # the calendar itself — has its own header
            ├── LoginPage.tsx, ProfilePage.tsx, RoleManagementPage.tsx
            └── NotFoundPage.tsx
```
