![Klokku Logo](https://klokku.com/klokku-github-banner.png)

# Klokku - track your time and balance your life

Klokku is an application designed to help you achieve a balanced lifestyle by optimizing daily routines and tracking time usage.
You can easily create and adjust time budgets for task groups and enable a structured approach to planning.
You can update your plan weekly, which gives you flexibility and ensures the plan remains realistic and aligned with your life’s demands.

Klokku provides a tool to monitor time allocation, offering insights into how time is spent and helping users make informed adjustments for continuous improvement. 

Read more on [klokku.com](https://klokku.com).


## Installation

Klokku application consists of two main components:
- [backend written in Go](https://github.com/klokku/klokku),
- frontend written in React (this repository).

You can find installation instruction in [the backend repository](https://github.com/klokku/klokku) and in the documentation on [the official website](https://klokku.com).

## Dashboard customization

Use the **Customize dashboard** icon in the Dashboard header to show, hide, and reorder dashboard cards for the current profile.
Tracking now always remains visible and first.
Changes sync across devices after **Save**; **Cancel** discards edits, and **Restore defaults** resets visibility and ordering when saved.

This feature requires backend support for `GET`, `PUT`, and `DELETE /api/user/current/dashboard` and the dashboard configuration database migration.
Deploy the backend before the frontend.
The frontend retains tracking controls and offers a retry if loading dashboard preferences fails.

## Progressive web app

Klokku can be installed from Chrome on Android or added to the home screen from Safari on iOS.
See the [mobile app guide](https://klokku.com/docs/getting-started/mobile-app/) for installation instructions.
The user menu offers **Install Klokku** on Android phones and iPhones, between **Integrations** and **Help & Feedback**.
It is hidden on desktop systems, tablets, and in standalone mode.
Internet access is required for data and changes; offline launches show a reconnect page.
An offline session preserves mounted editors and offers a connection retry without reloading.
If the session expires after an outage, a same-origin sign-in frame lets users reauthenticate without unloading their unfinished edits.
Keep authentication pages embeddable on the same origin; after signing in, users choose **Continue after signing in** to verify their original profile and resume.

The production build generates `manifest.webmanifest` and `sw.js` using `vite-plugin-pwa`.
The worker precaches build-time static assets, fetches page navigations from the network, and returns `offline.html` only when navigation fails.
It does not cache API responses, authentication pages, or the SPA HTML shell.
Keep hosted authentication redirects and `/auth/*` routes served by the authentication UI.
Serve the app over HTTPS (localhost works for development), with `sw.js` accessible from the application root and without long-lived immutable caching.

Updates wait for **Reload** or for all old app windows to close.
The app checks for updates on registration, hourly while visible, and when returning to the app or reconnecting.
Choosing **Reload** activates the update and reloads the window that requested it.
Other open windows retain their current UI until the user chooses to reload them.
If activation takes longer than ten seconds, reload consent expires and late activation shows a notice instead of interrupting edits.

Run `npm run generate-pwa-assets` to regenerate the Android and Apple icons from `public/klokku-icon.svg`.
Use `npm run build` and `npm run preview` to test the service worker; it is disabled during the normal development server.
Before releasing, test installation, standalone launch, login/logout, offline retry, and a waiting update on Android Chrome and iOS Safari.
