import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()
const db = getFirestore()
const auth = getAuth()
const messaging = getMessaging()

const REGION = 'us-east1'

// Deletes everything tied to the caller's own account: every RSVP they've
// made (RSVPs live under each event, 'events/{eventId}/rsvps/{uid}', not
// under the user's own doc, so this needs its own collection-group query
// rather than a single doc delete), their private profile subdoc, their
// public user doc, and finally the Firebase Auth account itself — done
// last since it's the one step that can't be retried once the Firestore
// data above is already gone.
export const deleteAccount = onCall({ region: REGION }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
  const uid = request.auth.uid

  const rsvpDocs = await db.collectionGroup('rsvps').where('uid', '==', uid).get()
  const batch = db.batch()
  rsvpDocs.forEach((rsvpDoc) => batch.delete(rsvpDoc.ref))
  batch.delete(db.doc(`users/${uid}/private/profile`))
  batch.delete(db.doc(`users/${uid}`))
  await batch.commit()

  await auth.deleteUser(uid)
  return { ok: true }
})

// Powers the "Avisarme si se cancela un evento" push notification (see
// web/src/lib/pushNotifications.ts) — fires when an event document is
// deleted (a cancellation) and notifies whichever topic(s) that event was
// visible to. Deliberately onDocumentDeleted only, not onDocumentUpdated
// — an edited event sends nothing, only an outright cancellation does.
const EVENT_TIME_ZONE = 'America/New_York'
const notificationWeekdayFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', timeZone: EVENT_TIME_ZONE })
const notificationDayFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', timeZone: EVENT_TIME_ZONE })
const notificationMonthFormatter = new Intl.DateTimeFormat('es', { month: 'long', timeZone: EVENT_TIME_ZONE })

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Builds the time manually (rather than relying on Intl's own 'es' AM/PM
// strings, which render as "a. m."/"p. m.") — English's own AM/PM parts
// come back as the plain "AM"/"PM" this reads as after lowercasing, no
// periods or extra formatting to strip.
function formatTime12h(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: EVENT_TIME_ZONE,
  }).formatToParts(date)
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('hour')}:${part('minute')}${part('dayPeriod').toLowerCase()}`
}

function formatEventDateTime(date: Date): string {
  const weekday = capitalizeFirst(notificationWeekdayFormatter.format(date))
  const month = capitalizeFirst(notificationMonthFormatter.format(date))
  return `${weekday}, ${notificationDayFormatter.format(date)} de ${month}, ${formatTime12h(date)}`
}

export const notifyOnEventCancellation = onDocumentDeleted(
  { document: 'events/{eventId}', region: REGION },
  async (event) => {
    const data = event.data?.data() as
      | {
          title?: string
          startDateTime?: Timestamp
          viewableForPublic?: boolean
          viewableForMinistry?: boolean
        }
      | undefined
    if (!data) return

    const topics: string[] = []
    if (data.viewableForPublic) topics.push('public-events')
    if (data.viewableForMinistry) topics.push('ministry-events')
    if (topics.length === 0) return

    const when = data.startDateTime ? formatEventDateTime(data.startDateTime.toDate()) : null
    const notification = {
      title: 'Evento cancelado',
      body: data.title
        ? `"${data.title}"${when ? ` — ${when}` : ''} ha sido cancelado.`
        : 'Un evento ha sido cancelado.',
    }
    await Promise.all(topics.map((topic) => messaging.send({ topic, notification })))
  },
)
