# App Store Release Checklist (Rocket)

Use this checklist for every iOS release.

## 1) Product Readiness

- Increment version and build number in Xcode target.
- Confirm app name, bundle id, and signing team are correct.
- Ensure Privacy Policy URL is valid and public.
- Confirm Terms URL (if required for your region/legal setup).

## 2) Compliance & Privacy

- Verify `PrivacyInfo.xcprivacy` is accurate for APIs used.
- Ensure no analytics/tracking SDKs are unintentionally added.
- Ensure App Store privacy answers match actual app behavior.
- Verify permissions in `Info.plist` are minimal and justified.

## 3) Security

- No secrets hardcoded in source.
- API keys are user-provided only and stored locally.
- ATS settings remain restrictive (no arbitrary loads).
- Confirm release builds use production signing identity/profile.

## 4) Quality Gates

- `npm run lint` passes.
- `npm run typecheck` passes.
- Test key flows on real device:
  - Chat send/receive
  - Attachment picking (file/image/video)
  - Local model catalog/filter/download
  - Stop download button
  - Settings save/reload
  - Conversation history persistence
- Verify app works without network for local-only flows where expected.

## 5) Build & Upload

- Run archive command:

```bash
npm run ios:archive
```

- Open Xcode Organizer and validate archive.
- Upload to App Store Connect.
- Enable TestFlight for internal testers first.

## 6) App Store Connect Listing

- App description and keywords updated.
- Category and age rating correct.
- Screenshots for required device classes.
- Support URL and Privacy Policy URL valid.
- Export compliance (encryption) answered correctly.

## 7) Final Review Before Submission

- Confirm no placeholder texts/URLs remain.
- Confirm no references to temporary app names.
- Confirm crash-free smoke test on latest iOS and one older supported iOS version.

## Notes

Some release steps (certificates, provisioning profiles, legal disclosures, screenshots) require manual action in Apple Developer / App Store Connect and cannot be fully automated in code.
