# What's left to build

The goal is the whole SnailyCAD website as a native app. For scale, the website has **83 pages**, the
CAD API about **450 routes**, and there are **31 live-update (socket) events**. The work is split into
stages; each stage ends with something you can test on a phone and could ship.

Tick the boxes as things are done. API paths are relative to the community's API URL
(`…/v1`); they're the same on the original SnailyCAD and the MySQL fork.

## Done: stage 1, getting in

- [x] Start a community (owner): API address check, owner sign-in, community code, QR code, invite link
- [x] Join a community: code, QR scan, invite link (`opssnailycad://join?api=…`)
- [x] Sign in: username + password, two-step code, temporary password → new password
- [x] Home (sections filtered by permission), Community tab (invite, switch), Account tab (sign out, remove)
- [x] Several communities on one phone
- [x] Tests: community codes, API errors, permissions

## Shared groundwork (needed before / alongside stage 2)

- [ ] **Data layer**: request caching, pull-to-refresh, paging, retry (TanStack Query) on top of `src/lib/api.ts`
- [ ] **Live updates**: socket.io client to the CAD (`<api>/socket.io`), the same events the website uses
      (911 calls, units, BOLOs, incidents, signal 100, panic…), reconnect on app resume
- [ ] **Values**: load and cache the CAD's values (`GET /admin/values/:path`: genders, ethnicities,
      licenses, vehicles, weapons, departments, divisions, codes 10, penal codes…), used by every form
- [ ] **Form kit**: text, select / search-select (values), date, switch, image picker + upload
      (multipart), custom fields (`/admin/manage/custom-fields`), validation messages like the website
- [ ] **CAD features**: respect the CAD's enabled / disabled features (`cad.features`) everywhere, like the website
- [ ] **Translations**: the CAD's languages (the website's `locales/*.json`), the user's chosen language
- [ ] **Images**: citizen / unit / user photos and the CAD logo (`/static/...`)
- [ ] **Sign in with Discord**: in-app browser to `/auth/discord`, hand the session cookies to the app
      (WKWebView → native cookie store); the CAD's Discord redirect must allow it
- [ ] **Account page** like the website: username, password, two-step setup (`/2fa`), Discord / Steam
      connections, API token (`/user/api-token`), language, sound settings
- [ ] **Notifications list** (`/notifications`)
- [ ] **App lock** (Face ID) option, and sign-out when the CAD session ends

## Stage 2: Citizen

Website pages: `citizen`, `citizen/create`, `citizen/[id]`, `citizen/[id]/edit`, `pets`, `pets/[id]`,
`business`, `business/[id]/…`, `truck-logs`, `bleeter`, `courthouse`, `law-book`, `tow`, `taxi`.

- [ ] My citizens list, create, edit, delete (`/citizen`)
- [ ] Citizen profile: photo, details, licenses + points (`/licenses`), medical records (`/medical-records`), aliases
- [ ] Vehicles: register, edit, transfer, delete (`/vehicles`)
- [ ] Weapons: register, edit, delete (`/weapons`)
- [ ] 911 call (`POST /911-calls`), tow and taxi requests (`/tow`, `/taxi`)
- [ ] Pets (`/pets`)
- [ ] Businesses: create / join, employees, posts, roles (`/businesses…`)
- [ ] Truck logs (`/truck-logs`)
- [ ] Bleeter: feed, posts, profiles (`/bleeter…`)
- [ ] Courthouse: expungement / name-change requests, court entries and posts (`/expungement-requests`,
      `/name-change`, `/court-entries`, `/courthouse-posts`)
- [ ] Law book (penal codes)
- [ ] Citizen claims (`/citizen-claims`)
- [ ] Tow / taxi pages for tow and taxi drivers (calls list, assign, end) and tow logs

## Stage 3: LEO + EMS/FD

Website pages: `officer` (+ `call-history`, `dmv`, `impound-lot`, `incidents`, `jail`, `my-officers`,
`my-officer-logs`, `my-record-reports`, `penal-codes`, `bureau-of-firearms`, `supervisor/*`),
`ems-fd` (+ `hospital-services`, `incidents`, `my-deputies`, `my-deputy-logs`), `dot` (+ `my-workers`,
`my-worker-logs`).

- [ ] My officers / deputies / DOT workers: create, edit, delete (`/leo`, `/ems-fd`, `/dot`)
- [ ] Go on duty: pick unit, status buttons (10-codes), off duty, active unit header (`/dispatch/status`)
- [ ] Panic button, signal 100 banner, tones
- [ ] Active 911 calls: list, details, events, attach / detach self, end (`/911-calls`, `/911-calls/events`)
- [ ] Active BOLOs (`/bolos`)
- [ ] Name / plate / weapon / business search, and the actions on results (`/search`, `/search/actions`, `/notes`)
- [ ] Records: tickets, arrest reports, written warnings, warrants (`/records`), penal code picker
- [ ] Incidents (`/incidents`, `/ems-fd/incidents`)
- [ ] Unit messages / private messages (`/unit-messages`, `/dispatch/private-message`)
- [ ] Officer logs, call history, my record reports
- [ ] Impound lot, jail (`/leo/jail`), DMV (`/leo/dmv`), bureau of firearms, drug tests
- [ ] Supervisor: citizen logs, license exams (`/leo/license-exams`)
- [ ] EMS/FD: hospital services, medical records, declare dead / alive
- [ ] DOT: work orders board (`/dot/work-orders`)

## Stage 4: Dispatch

Website pages: `dispatch`, `dispatch/map`, `dispatch/erlc`, `radio`.

- [ ] Active units (officers, deputies, DOT, combined units) with status, assignment, edit callsigns (`/dispatch`)
- [ ] 911 calls: create, assign units, events, end, priority (`/911-calls`)
- [ ] Incidents, BOLOs, AOP, signal 100, tones (`/tone-presets`)
- [ ] Temporary units (`/temporary-units`)
- [ ] Dispatch search (`/search` for dispatch)
- [ ] **Radio**: the CAD radio in the app (`/radio/token` + the radio protocol, see the CAD's
      `docs/radio/protocol.md`), push-to-talk button, background audio (needs the iOS audio background mode)
- [ ] Live map (only if the CAD has a live map URL)
- [ ] ER:LC page (only on CADs with ER:LC)

## Stage 5: Admin

Website pages: `admin`, `admin/manage/*`, `admin/values/*`, `admin/import/*`.

- [ ] Admin dashboard (counts, `/admin`)
- [ ] Users: list, search, edit rank / permissions / roles, ban, temp password, whitelist (`/admin/manage/users`)
- [ ] Units: list, edit, suspend, callsigns, duty hours, department time logs (`/admin/manage/units…`)
- [ ] Citizens: list, edit, delete, prune, records logs (`/admin/manage/citizens…`)
- [ ] Businesses (`/admin/manage/businesses`)
- [ ] Courthouse: pending warrants, expungements, name changes
- [ ] Citizen claims, custom fields, custom roles
- [ ] Values: every value type, penal codes + groups (`/admin/values/:path`, `/admin/penal-code-group`)
- [ ] CAD settings: general, features, misc, Discord roles / webhooks, API token, live map, radio
      (`/admin/manage/cad-settings…`). The owner-only parts (`.env` editor, import from PostgreSQL,
      update / uninstall) stay on the website: they need a desktop and are risky on a phone.
- [ ] Audit logs

## Before the App Store

- [ ] App icon and splash in your branding (the template ones are still in `assets/`)
- [ ] Apple Developer account, `eas init`, production build, TestFlight test with real users
- [ ] App Store listing: description, screenshots (6.7" and 6.1"), privacy details, support URL,
      privacy policy URL
- [ ] A **review community + test account** for Apple (they must be able to join and sign in)
- [ ] Name check: "Ops SnailyCAD" uses the SnailyCAD name; get the maintainers' OK or rename
- [ ] If Discord sign-in ships: check guideline 4.8 (Apple may ask for Sign in with Apple as well)
- [ ] Turn on CI: move `ci/check.yml` to `.github/workflows/check.yml`

## Nice to have later

- [ ] **Push notifications** (new 911 call, panic, assigned to a call). The CAD has no push support,
      so this needs a small relay service plus a CAD change: it's the one feature that can't work
      with "any SnailyCAD" as-is.
- [ ] iPad layout (dispatch on a tablet)
- [ ] Android release (the code already builds for Android; needs a Play Store account)
- [ ] Widgets / Live Activity for on-duty status
