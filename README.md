# Church Calendar Template

A role-based event calendar I built for my own church, cleaned up into a template so other
churches — or developers building for one — can start from something real instead of a blank
repo. Drop it into an existing church site, embedded or just linked out to.

Some churches already have a website but no real calendar. This is meant to fill that one gap.

## What's Inside

Five roles — Pastor, Co-admin, Encargado (ministry leader), Ministry member, and Public — are
enforced server-side in Firestore's own security rules, not just hidden in the UI, so a public
church-wide calendar and a members-only ministry calendar can share the same event model safely.
Recurring events, multi-day events, RSVPs, and a role/ministry management panel are all built in.

## See It In Action

- [Church Website Template](https://github.com/amy14rubio/church-website-template) — a companion
  full-site template, if you'd rather have the calendar as part of a bigger build
- [Live example](https://comunidadcristianalapalabradefe.com/calendario) — a real church calendar built on this template

To run this yourself, see [SETUP.md](SETUP.md).

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, react-big-calendar <br>
**Backend:** Firebase Authentication, Cloud Firestore, Storage <br>
**Mobile (optional):** Capacitor (iOS/Android) <br>
**Development Tools:** Git, Firebase CLI

## License

MIT © [Amyruth Rubio](https://github.com/amy14rubio) — see [LICENSE](LICENSE).
