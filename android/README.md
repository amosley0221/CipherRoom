# The Cipher Room — Android app

A thin native wrapper that ships the existing web app as an installable APK.
**The website is not modified by any of this.** `tools/build_web_assets.py`
*copies* the site into `app/src/main/assets/` at build time and rewrites only
that copy.

## Download it

Every push builds an APK and attaches it to a rolling GitHub release:

**<https://github.com/amosley0221/CipherRoom/releases/download/android-latest/CipherRoom.apk>**

Open that link on an Android phone, allow installs from your browser when
prompted, then open the download and tap **Install**. Play Protect will note
that the app came from outside the Play Store — choose **Install anyway**.

Each run also uploads the APK as a workflow artifact under
**Actions → Android APK**, which is handy for testing a branch build.

## How it works

`MainActivity` is a single `WebView` served by `WebViewAssetLoader` from the
virtual origin `https://appassets.androidplatform.net/`. That detail carries
real weight:

* the site links everything with root-absolute paths (`/app.jsx`, `/icons/…`),
  which resolve correctly against a real origin but not against `file://`;
* `localStorage` — where saved progress and the chosen palette live — is only
  available on a proper origin.

The bundler makes the app fully offline:

| Bundled | How |
| --- | --- |
| `index.html`, the `.jsx` sources, `manifest.webmanifest`, `icons/` | copied verbatim |
| React 18.3.1, ReactDOM 18.3.1 | pulled from the npm release tarballs; the **production** UMD builds replace the development ones the site loads, for a smaller and faster build on a phone |
| `@babel/standalone` 7.29.0, three.js 0.160.0 | pulled from the npm release tarballs, unchanged |
| Fraunces / JetBrains Mono / Instrument Serif | the Google Fonts stylesheet and its woff2 files are downloaded and rewritten to point at local copies |

`sw.js` is deliberately left out: every asset is already local, so the service
worker has nothing to cache, and `index.html` already handles a registration
that fails.

A few behaviours differ from a browser tab, on purpose:

* text zoom is pinned to 100% — the layout is a fixed typographic design that
  overflows under large system font scales;
* automatic dark-mode inversion is off, since the site ships its own six
  palettes (one of them light);
* back exits only on a second press within two seconds, so a stray tap doesn't
  drop you out of a chapter.

## Building locally

Needs JDK 17, Python 3 and an Android SDK with platform 34.

```sh
cd android
./gradlew assembleRelease      # bundles the web app, then builds
# -> app/build/outputs/apk/release/app-release.apk
```

The `bundleWebApp` Gradle task runs the bundler automatically, so the APK is
never built against stale assets.

## Signing

`keystore/cipherroom.jks` is checked in (store and key password: `cipherroom`)
so that anyone can build an APK that actually installs, and so that consecutive
builds install *over* each other as updates rather than being rejected as a
different app.

This key is public by definition and is **not** a secret. It is fine for
sideloading; it is not suitable for the Play Store. To sign with a private key
instead, set four repository secrets and CI will use them automatically:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 your-key.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | key alias |
| `ANDROID_KEY_PASSWORD` | key password |

Note that switching keys changes the app's identity: an APK signed with a new
key will not install over one signed with the old one.

## Versioning

CI sets `versionName` to `1.0.<run number>` and `versionCode` to the run number,
so every build is an upgrade over the last. Pushing a `v*` tag builds that
version name instead and publishes a permanent release alongside the rolling
one.
