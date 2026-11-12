# Ops SnailyCAD (iOS / Android app)

A mobile app for **any SnailyCAD v4 community**. One app on the App Store; each community connects
its own CAD.

- **Start a community** (the CAD owner): enter the CAD's API address, sign in as the owner, and
  share the community code / QR code / invite link.
- **Join a community** (everyone else): type the code, scan the QR code or tap the invite link,
  then sign in with **their own CAD account**.

There's no central server and no API token in the app: the community code *is* the CAD's API
address (e.g. `cad-api.yourcommunity.com`), so it works with the original SnailyCAD and with
forks, without any change on the CAD. Sharing the code gives nobody access; they still need an
account on that CAD.

## Status

The full list of what's left, with checkboxes, is in [ROADMAP.md](ROADMAP.md).

| Stage | What | State |
| --- | --- | --- |
| 1 | Start / join a community, QR + invite link, sign in (password, two-step code, temporary password), home, switch community, sign out | **done** |
| 2 | Citizen: citizens, vehicles, weapons, licenses, 911 / tow / taxi calls | next |
| 3 | LEO + EMS/FD: status, active calls, BOLOs, searches, records, incidents | planned |
| 4 | Dispatch: active units, calls, incidents, BOLOs, radio | planned |
| 5 | Admin: users, units, citizens, values, CAD settings | planned |
| – | Discord sign-in (in-app browser + session hand-over) | planned |

## Requirements for a community's CAD

- Reachable over **HTTPS** (iPhones refuse plain HTTP, except on a local network for testing).
- The API address is `NEXT_PUBLIC_PROD_ORIGIN` from the CAD's `.env`
  (e.g. `https://cad-api.yourcommunity.com/v1`).
- The CAD's `DOMAIN` setting must match its domain, so the session cookie is kept (same as for
  the website).

## Develop

Needs Node 22+.

```bash
npm install
npx expo start          # scan the QR code with a development build on your phone
npm test                # unit tests
npm run typecheck
npx expo lint
npx expo-doctor
```

The app uses native modules (camera, secure storage), so use a **development build** rather
than Expo Go:

```bash
npx eas-cli@latest build --profile development --platform ios
```

Code layout: `src/app/` are the screens (Expo Router), `src/lib/` talks to the CAD (`api.ts`,
`session.tsx`, `community.ts`), `src/ui/` holds shared components.

## Build and publish to the App Store

1. An **Apple Developer** account ($99/year) and an **Expo** account.
2. `npx eas-cli@latest login`, then `npx eas-cli@latest init` (links the project to your Expo
   account) and `npx eas-cli@latest build:configure`.
3. `npx eas-cli@latest build --platform ios --profile production` (EAS creates the certificates).
4. `npx eas-cli@latest submit --platform ios` uploads it to App Store Connect; fill in the
   listing, privacy details (the app stores nothing off the phone except what the user's own CAD
   receives) and a **review account**: Apple needs a working community code and a test login.

Bundle id: `cloud.opslabsystems.opssnailycad` (change it in `app.json` before the first build
if you want another one). Invite links use the `opssnailycad://` scheme.

Naming: the app is called "Ops SnailyCAD". SnailyCAD is someone else's project; if Apple asks,
be ready to show the SnailyCAD maintainers are fine with the name, or rename it in `app.json`.

## Continuous integration

`ci/check.yml` runs the iOS bundle, typecheck, lint and tests on every push. To turn it on, move it to `.github/workflows/check.yml` (it was left out of the first push because the token used could not add workflows).
