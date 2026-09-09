import type { Timestamp } from 'firebase/firestore'

// Mirrors PROJECT_SPEC.md section 29. `role` values match the spec exactly:
// admin = Pastor, coAdmin = Co-admin, leader = Encargado, ministryMember = Ministerio de Ayuda,
// member = a plain signed-in church member with no ministry-calendar access yet.
//
// 'member' is the actual self-provisioned default now (see AuthContext) —
// 'ministryMember' is no longer something every new account starts as. It's
// granted only once an admin/co-admin approves a ministry-calendar access
// request (see src/lib/ministryAccess.ts), and can be revoked back to
// 'member' the same way. See PROJECT_SPEC.md's "Ministry Calendar Access"
// section for why this piggybacks on the existing role field instead of a
// separate boolean flag.
export type UserRole = 'admin' | 'coAdmin' | 'leader' | 'ministryMember' | 'member'

// Whether — and where in the flow — this account has asked for ministry-
// calendar access. Only meaningful while role is 'member'; approving a
// request promotes role straight to 'ministryMember' rather than leaving a
// lingering 'approved' status to track here (there's nothing left to show
// once the role itself reflects it). 'rejected' still allows requesting
// again later (see requestMinistryAccess).
export type MinistryAccessRequestStatus = 'none' | 'pending' | 'rejected'

export interface AppUser {
  uid: string
  name: string
  role: UserRole
  ministryIds: string[]
  // null until a real photo is set — Google's own (copied in automatically
  // whenever available and not opted out of, see AuthContext) or one the
  // user uploaded (src/lib/profilePicture.ts). Avatar falls back to a
  // colored initial until then.
  photoURL: string | null
  // Non-destructive crop, same model as a site photo's own focal point
  // (see ImageFocalPoint's doc comment and lib/imageFocalPoint.ts) —
  // null/absent means show the photo uncropped (plain object-cover).
  // Reset to null whenever photoURL changes (a fresh photo's own default
  // framing has no relationship to whatever crop was tuned for the old
  // one) — see uploadProfilePicture.
  photoFocalPoint?: ImageFocalPoint | null
  // Once true, AuthContext never again auto-copies a signed-in provider's
  // photo (e.g. Google's) into photoURL — set by removeProfilePicture, so
  // "quitar foto" sticks permanently instead of the next Google login
  // silently restoring it.
  photoRemovedByUser: boolean
  ministryAccessRequestStatus: MinistryAccessRequestStatus
  // Null until a request has ever been made; kept even after approval/
  // rejection purely so an admin's request list can show "requested on X."
  ministryAccessRequestedAt: Timestamp | null
  // Whether the one-time "do you serve in a ministry?" prompt (shown right
  // after this account's first sign-in) has already been shown — flips to
  // true the first time regardless of whether they requested or dismissed
  // it, so it never appears again; the request itself stays available
  // afterward from ProfilePage. See MinistryAccessPromptModal.
  ministryAccessPromptShown: boolean
  // This browser's Firebase Cloud Messaging registration token, once
  // they've opted in to event-cancellation push notifications from
  // Configuración (see src/lib/pushNotifications.ts) — null/absent means
  // not subscribed. Optional since every account predating this feature
  // has no such field at all yet (see the ministry-access-fields lesson:
  // a missing field must never be assumed present).
  fcmToken?: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

// users/{uid}/private/profile — split out of AppUser on purpose (see
// firestore.rules' users/{uid}/private/{docId} match). Every other
// AppUser field is readable by any signed-in member (needed for
// attendee lists, RSVP names, etc.); email is not — anyone can sign up
// with no approval at all, so a broadly-readable email field would let
// any throwaway account scrape the whole congregation's real emails.
// Only the account owner and the Pastor/Co-admin (for the two admin
// screens that legitimately need it) can read this doc.
export interface UserPrivateProfile {
  email: string
}

// PROJECT_SPEC.md section 30. Ministries are data, not code — never hardcode
// a ministry list in the app.
export interface Ministry {
  id: string
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// PROJECT_SPEC.md section 31. `ministryId: null` means a church-wide event.
//
// Recurrence extension (not in the original spec): every event has a
// `seriesId` — for a standalone event it's just that event's own doc id,
// and for a recurring series every generated occurrence shares the same
// seriesId. This means "find the other occurrences" is always the same
// query (`where('seriesId', '==', ...)`) regardless of whether the event
// recurs. `recurrenceFrequency`/`recurrenceUntil` are non-null on every
// occurrence of a real series (all identical) and null on a standalone
// event — checking either field on a single doc is enough to know "is
// this part of a series," no extra query needed.
export type RecurrenceFrequency = 'weekly' | 'monthly'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  startDateTime: Timestamp
  endDateTime: Timestamp
  location: string
  ministryId: string | null
  seriesId: string
  recurrenceFrequency: RecurrenceFrequency | null
  recurrenceUntil: Timestamp | null
  createdBy: string
  updatedBy: string
  viewableForMinistry: boolean
  viewableForPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// PROJECT_SPEC.md section 23 names 'attending'/'not_attending' as the
// minimum required; 'maybe' is an addition (Google Calendar-style
// Yes/No/Maybe), not a spec conflict — the spec says "at minimum".
export type RsvpStatus = 'attending' | 'not_attending' | 'maybe'

// One RSVP document per user per event, stored at
// events/{eventId}/rsvps/{uid}. `name` is denormalized from the user's
// profile at RSVP time so the attendance list can render without an extra
// read per attendee — a name edited later (see ProfilePage) doesn't
// retroactively update past RSVPs, but that staleness is harmless here.
export interface Rsvp {
  uid: string
  name: string
  status: RsvpStatus
  updatedAt: Timestamp
}

// A purely cosmetic, non-destructive adjustment for how a cropped photo
// (see ImageFocalPointModal, used by the profile picture uploader)
// displays within its box — applied at render time via a CSS
// `transform` (never `position`/width/height), never touching the
// underlying image file.
//
// Stored as the literal visible rectangle — a fraction (0-1) of the
// original image's own natural width/height, plus that image's own
// aspect ratio — computed directly from the cropper's pixel-space crop
// Area.
export interface ImageFocalPoint {
  x: number // 0-1, fraction of the image's own natural width
  y: number // 0-1, fraction of the image's own natural height
  width: number // 0-1, fraction of the image's own natural width
  height: number // 0-1, fraction of the image's own natural height
  imageAspectRatio: number // naturalWidth / naturalHeight, captured at crop time
}
