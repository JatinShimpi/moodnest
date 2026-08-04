# Privacy Policy — moodnest

_Last updated: 2026-08-05_

moodnest is a personal, single-user tool for organizing saved visual inspiration into
custom moodboards. It is not a public service — it runs locally on the developer's own
machine and is not distributed to or used by other end users.

## What data this app touches

- **Board, section, and pin data you create** (image URLs, titles, your own notes) is
  stored in a single local JSON file on your own device (`server/data.json`). It is never
  transmitted to any third-party server controlled by the developer, and no analytics or
  tracking of any kind is included in the app.
- **Image/title lookups**: when you paste a saved-pin URL to auto-fill an image and title,
  the app makes a direct request to that platform's public oEmbed endpoint from your own
  machine to fetch the image URL and title. No data about you or your boards is sent in
  that request beyond the URL you pasted.
- **Account authentication** (if/when OAuth is enabled): if you connect your own account
  to import boards, the resulting access token is stored locally on your own device only,
  is used solely to read your own boards/pins on your own behalf, and is never sent
  anywhere except back to the platform's own API to make those read requests.

## What this app does not do

- No user accounts, no sign-up, no multi-user data storage
- No analytics, telemetry, or third-party trackers
- No advertising
- No sharing, selling, or transmitting your data to any third party
- No server-side storage — all data lives on your own device

## Contact

This is a personal project. Questions can be raised via the GitHub repository's issue
tracker.
