# Vocora mobile — 2-day production checklist

## Day 1: credentials, builds, internal testing

1. In Google Cloud Console create the following OAuth 2.0 clients in the same project.
   - Web application: Authorized JavaScript origins are `https://vocora.uz` and `https://www.vocora.uz`. Leave Authorized redirect URIs empty for the current Google Identity Services button.
   - iOS: bundle ID `uz.vocora.mobile`.
   - Android: package `uz.vocora.mobile`. First run `eas credentials -p android` and copy the EAS keystore **SHA-1**. Create an Android client with that SHA-1. After the first Play upload, create another Android client with the **App signing key certificate SHA-1** in Play Console → Release → Setup → App integrity. These Android client IDs stay in Google Cloud; the app selects them by its package and signing certificate.
2. Set the production mobile variables in EAS:

   ```sh
   cd apps/mobile
   eas login
   npx eas-cli@latest env:set --name EXPO_PUBLIC_API_URL --value https://api.vocora.uz --environment production --visibility plaintext
   npx eas-cli@latest env:set --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value YOUR_WEB_CLIENT_ID --environment production --visibility plaintext
   npx eas-cli@latest env:set --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value YOUR_IOS_CLIENT_ID --environment production --visibility plaintext
   npx eas-cli@latest env:pull --environment production
   npm run check:release
   ```

3. Set the production API variables:
   - `GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID`
   - `APPLE_CLIENT_ID=uz.vocora.mobile`
4. In Apple Developer, enable Sign in with Apple for `uz.vocora.mobile`.
5. Build store binaries:

   ```sh
   npx eas-cli@latest build --platform all --profile production
   ```

6. Upload to TestFlight and Google Play internal testing:

   ```sh
   npx eas-cli@latest submit --platform ios --profile production
   npx eas-cli@latest submit --platform android --profile production
   ```

## Day 2: release-candidate test matrix

- Fresh install: email registration, Google sign-in, Apple sign-in, onboarding, and first lesson.
- Returning session: terminate and reopen the app; verify the session and profile restore correctly.
- Authentication failures: offline mode, canceled provider dialog, wrong password, and expired session.
- Core loop: Today, library search, word detail/audio, add to cards, review, progress, IELTS entry points.
- Account controls: edit name/language, log out, and delete a disposable test account from Menu → Profile.
- Devices: smallest supported iPhone, current large iPhone, iPad portrait/landscape, small Android phone, and current Android phone.
- Store-signed Google auth: test the Play-installed build, not only a local APK, because signing certificates differ.
- Verify production API traffic uses HTTPS and never points to localhost or a LAN IP.
- Verify push permission, the 20:00 local reminder, and token registration. Remote
  push requires APNs credentials and an FCM v1 service-account key in EAS.

## Store listing links and declarations

- Privacy policy: `https://vocora.uz/en/legal/privacy`
- Terms: `https://vocora.uz/en/legal/terms`
- Support: `https://vocora.uz/en/support`
- Account deletion: `https://vocora.uz/en/account/delete`
- Complete Apple App Privacy and Google Play Data safety declarations from the actual production data flows.
- Add screenshots for phone sizes and iPad if the iPad target remains enabled.

## Known dependency note

`npm audit --omit=dev` currently reports Expo/Metro build-tool advisories whose automated fix upgrades Expo across breaking SDK versions. Do not run `npm audit fix --force` immediately before release; schedule and test the Expo SDK upgrade separately.
