# My Lab Collection — Notification update (safe staged build)

## Important status
This package is a **staged code update, not a deployed production release**. It adds an in-app notification panel and Service Worker handlers for Web Push. Background push at 6 AM/10 PM and every 10 days will NOT work until a secure server-side push sender, push-subscription enrollment, VAPID keys, and scheduled Firebase backend are configured and deployed. No Firebase data migration is included.

## Data-safety boundaries
- Original source files were copied to a separate working folder before editing.
- Patient record structure, Firebase collections, payment logic, settings UI, PDF/WhatsApp code and Google Sheets Apps Script were not intentionally rewritten.
- Notification history uses a separate browser `localStorage` key (`mlc_notifications_v1`) and is device/browser-local; it is not synced across devices.
- Notification history cleanup is not implemented as deletion of patient data.
- Patient success notification is attempted only after the app's existing cloud sync promise resolves successfully. Local save still follows the original app behavior.
- Daily summaries are generated on app initialization, not at a guaranteed scheduled time. Totals are based on records currently loaded in the app; this is not a substitute for server-side reports. The app has no payment transaction ledger, so the summary cannot reconstruct historical partial payments beyond the saved record fields.
- Backup reminder is only a reminder. The current `no-cors` Apps Script request cannot prove that the spreadsheet write succeeded.

## Files
- `index.html` — original app with notification panel, local history, and daily summary-on-launch.
- `sw.js` — existing shell caching behavior plus push/click handlers.
- `manifest.webmanifest` — copied unchanged.
- `firebase-functions/` — server-side schedule/push setup still needs to be implemented after reviewing current Firestore rules and confirming Firebase plan/permissions.

## Before production deployment
1. Export a fresh, verified Firestore backup and Google Sheets copy. Keep the original `index.html`, `sw.js`, manifest and icons unchanged in a separate Git branch/backup.
2. Deploy this package to a **preview/staging** Vercel URL first, not the live production URL.
3. Confirm login, local save, cloud save, edit, soft-delete, payment fields, PDF receipt, WhatsApp receipt, reports, settings and backup flow. Compare selected records in Firestore before/after; no records should be added/removed except deliberate test records.
4. Verify notification permission on Android. Permission grants foreground alerts only in this stage; do not expect background alerts yet.
5. Before enabling backend push, implement and review Firebase Rules for a user-owned `users/{uid}/notificationTokens` path; never make it public. Add a server-side scheduled function with `Asia/Kolkata` timezone, idempotency keys, least-privilege service account and privacy-safe lock-screen text.
6. Deploy backend only after reviewing actual Firebase Rules, Cloud Functions billing/plan, VAPID key handling, and backup/restore. Never paste service-account private keys or secrets into GitHub or HTML.
7. If anything fails, revert the Vercel deployment to the previous release. Do not run data migration, mass overwrite, or delete operations for notification deployment.

## Checks run on this package
- HTML/JS structural anchors were patched into the supplied file; no wholesale rewrite of existing app code was done.
- Static checks should be run again in your project tooling before production. Browser/Firebase integration and Android delivery have not been executed here.

## Limitation
I cannot deploy to your Vercel/Firebase account from this workspace. This package is ready for review/staging upload, but is not a claim that scheduled background notifications are live.
