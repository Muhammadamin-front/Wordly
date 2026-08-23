# Vocora Mobile

Expo mobile client for the same FastAPI backend as `apps/web`. It provides native mobile equivalents for the launch vocabulary loop plus IELTS, grammar, games, expressions, community, achievements, AI Coach, classes/teacher tools, billing, support/legal pages, and public profiles. Operational admin and content management stay on the desktop web panel.

## Run

1. Start the API locally on port 8000 (from the repo root: `npm run dev:api`).
2. In a second terminal: `cd apps/mobile && npm install`.
3. Create a native development build. Google and Apple auth use native modules and do not run in Expo Go.
4. Start Expo: `npm start`.

Without an override, the client uses `http://127.0.0.1:8000` on iOS and `http://10.0.2.2:8000` on an Android emulator. For Expo Go on a physical device, copy `.env.example` to `.env`, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP (for example `http://192.168.1.20:8000`), and make sure the API is listening on the LAN interface.

## Google OAuth

Create three OAuth clients in the same Google Cloud project:

- **Web application**: add `https://vocora.uz` and `https://www.vocora.uz` as Authorized JavaScript origins. Google Identity Services does not need an Authorized redirect URI for the current web button.
- **iOS**: use bundle ID `uz.vocora.mobile`.
- **Android**: use package name `uz.vocora.mobile` and add both the EAS upload-key SHA-1 and the Google Play App Signing SHA-1.

The API `GOOGLE_CLIENT_ID`, web `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and mobile `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` must all contain the same **Web application** client ID. Save the iOS client ID in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. Create Android OAuth clients in Google Cloud for each signing SHA-1, but do not add their client IDs to the app: Google selects the matching Android client from the package name and signing certificate. OAuth client IDs are public identifiers; never put a Google client secret in the app.

For local development, copy `.env.example` to `.env`. For cloud builds, save these three `EXPO_PUBLIC_*` values in the EAS `production` environment:

```sh
eas env:set --name EXPO_PUBLIC_API_URL --value https://vocora.uz --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value YOUR_WEB_CLIENT_ID --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value YOUR_IOS_CLIENT_ID --environment production --visibility plaintext
eas env:list --environment production
```

`app.config.ts` derives the required reversed iOS URL scheme from the iOS client ID during the native build.

The API client appends `/api/v1` itself. If production serves that path through `https://vocora.uz/api/v1`, use `https://vocora.uz` as shown above; do not include `/api/v1` in the variable.

For native Sign in with Apple, enable the capability for `uz.vocora.mobile` in Apple Developer and set the API production variable `APPLE_CLIENT_ID=uz.vocora.mobile`. No Apple private key or secret belongs in the mobile app.

Before a release build, pull the EAS values and run the release guard:

```sh
eas env:pull --environment production
npm run check:release
```

## Production builds

`eas.json` contains preview and production profiles. After `eas login` and the first project setup, build both store binaries with:

```sh
eas build --platform all --profile production
```

Submit a successful build with `eas submit --platform ios --profile production` and `eas submit --platform android --profile production`. Test Google sign-in from a store-signed Android build because its SHA-1 differs from local and upload certificates.

## Payments

Payme, Click, and Uzum Checkout are hosted web payments. They can be shown by
the web client, but native iOS and Android builds deliberately do not open an
external card checkout. Store billing is a separate future integration; an
existing Premium entitlement purchased on the web is shared with the mobile
app after the learner signs in.

## API types

With the API running:

```sh
npm run generate:api
```

This writes `openapi.json` and the generated `src/api/schema.ts`. Do not hand-edit the schema file.

## Authentication

The client identifies auth requests with `X-Client: mobile`, stores access and refresh tokens in `expo-secure-store`, and schedules refresh one minute before access-token expiry. The FastAPI response sends the refresh token only for that mobile header; browser clients keep using the scoped httpOnly cookie.

## Deliberately deferred

Push notifications, full offline sync, bulk CSV/document import, and mobile-native account-data export remain deferred. Admin and content-management workflows deliberately stay on desktop web. Teaching, billing, social, grammar, games, skills, IELTS, AI Coach, and support/legal product areas are native mobile screens and use the same production API and authored content as the web client.
