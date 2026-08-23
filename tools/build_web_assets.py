#!/usr/bin/env python3
"""Bundle the Cipher Room web app into the Android app's assets directory.

The website itself is never modified. This script copies the site into
android/app/src/main/assets/ and rewrites *only the copy* of index.html so the
APK runs completely offline:

  * the four unpkg <script> tags are pointed at vendored copies under /vendor/,
    extracted from the matching npm release tarballs (React and ReactDOM swap
    to their production builds -- same 18.3.1 UMD globals, but far smaller and
    faster on a phone),
  * the Google Fonts stylesheet is downloaded, its woff2 files are pulled in
    alongside it, and the <link> is pointed at the local copy,
  * sw.js is deliberately left out of the bundle: every asset is already local,
    so the service worker has nothing to cache, and index.html already handles
    a failed registration.

Usage:  python3 tools/build_web_assets.py [--out DIR]
"""

import argparse
import io
import os
import re
import shutil
import sys
import tarfile
import urllib.request

ROOT = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
DEFAULT_OUT = os.path.join(ROOT, "android", "app", "src", "main", "assets")

# Site files that belong in the APK. Everything else in the repo (uploads/,
# scripts/, render.yaml, the standalone HTML export, sw.js) is skipped.
COPY_FILES = ["index.html", "manifest.webmanifest"]
COPY_GLOBS = ["*.jsx"]
COPY_DIRS = ["icons"]

# unpkg URL as it appears in index.html -> where the file lands in the bundle,
# plus the npm tarball and the member inside it to pull it from. The npm
# registry is used rather than unpkg because it is the canonical, immutable
# source for these exact versions.
VENDOR_SCRIPTS = [
    (
        "https://unpkg.com/react@18.3.1/umd/react.development.js",
        "vendor/react.production.min.js",
        "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
        "package/umd/react.production.min.js",
    ),
    (
        "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
        "vendor/react-dom.production.min.js",
        "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
        "package/umd/react-dom.production.min.js",
    ),
    (
        "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
        "vendor/babel.min.js",
        "https://registry.npmjs.org/@babel/standalone/-/standalone-7.29.0.tgz",
        "package/babel.min.js",
    ),
    (
        "https://unpkg.com/three@0.160.0/build/three.min.js",
        "vendor/three.min.js",
        "https://registry.npmjs.org/three/-/three-0.160.0.tgz",
        "package/build/three.min.js",
    ),
]

# A desktop Chrome UA makes fonts.googleapis.com serve woff2 rather than ttf.
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def write(out_dir, rel_path, data):
    dest = os.path.join(out_dir, rel_path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(data)
    return dest


def copy_site(out_dir):
    import glob

    for name in COPY_FILES:
        shutil.copy2(os.path.join(ROOT, name), os.path.join(out_dir, name))
    for pattern in COPY_GLOBS:
        for path in sorted(glob.glob(os.path.join(ROOT, pattern))):
            shutil.copy2(path, os.path.join(out_dir, os.path.basename(path)))
    for name in COPY_DIRS:
        shutil.copytree(os.path.join(ROOT, name), os.path.join(out_dir, name))


def vendor_scripts(out_dir, html):
    tarballs = {}
    for original, rel_path, tarball_url, member in VENDOR_SCRIPTS:
        if tarball_url not in tarballs:
            sys.stderr.write("  fetching %s\n" % tarball_url)
            tarballs[tarball_url] = tarfile.open(
                fileobj=io.BytesIO(fetch(tarball_url)), mode="r:gz"
            )
        extracted = tarballs[tarball_url].extractfile(member)
        if extracted is None:
            raise SystemExit("%s is missing from %s" % (member, tarball_url))
        write(out_dir, rel_path, extracted.read())

        if original not in html:
            raise SystemExit("index.html no longer references %s" % original)
        html = html.replace(original, "/" + rel_path)

    # The vendored files are local, so subresource-integrity hashes (computed
    # against the development builds) and crossorigin no longer apply.
    html = re.sub(r'\s+integrity="[^"]*"', "", html)
    html = re.sub(r'\s+crossorigin="anonymous"', "", html)
    return html


def vendor_fonts(out_dir, html):
    match = re.search(r'<link href="(https://fonts\.googleapis\.com/css2[^"]+)"[^>]*>', html)
    if not match:
        raise SystemExit("could not find the Google Fonts <link> in index.html")
    css_url = match.group(1).replace("&amp;", "&")

    sys.stderr.write("  fetching %s\n" % css_url)
    css = fetch(css_url).decode("utf-8")

    for i, font_url in enumerate(sorted(set(re.findall(r"url\((https://[^)]+)\)", css)))):
        name = "f%03d-%s" % (i, os.path.basename(font_url.split("?")[0]))
        write(out_dir, "vendor/fonts/" + name, fetch(font_url))
        css = css.replace(font_url, name)

    write(out_dir, "vendor/fonts/fonts.css", css.encode("utf-8"))
    html = html.replace(match.group(0), '<link href="/vendor/fonts/fonts.css" rel="stylesheet">')
    # Nothing is loaded from Google's servers any more.
    html = re.sub(r'\s*<link rel="preconnect" href="https://fonts\.[^"]+"[^>]*>', "", html)
    return html


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=DEFAULT_OUT)
    args = parser.parse_args()
    out_dir = os.path.abspath(args.out)

    if os.path.isdir(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)

    sys.stderr.write("bundling web app -> %s\n" % out_dir)
    copy_site(out_dir)

    index_path = os.path.join(out_dir, "index.html")
    with open(index_path, encoding="utf-8") as fh:
        html = fh.read()

    html = vendor_scripts(out_dir, html)
    html = vendor_fonts(out_dir, html)

    with open(index_path, "w", encoding="utf-8") as fh:
        fh.write(html)

    if re.search(r'(src|href)="https?://', html):
        raise SystemExit("index.html still points at a remote resource")

    total = sum(
        os.path.getsize(os.path.join(dirpath, f))
        for dirpath, _, files in os.walk(out_dir)
        for f in files
    )
    sys.stderr.write("bundled %.1f MiB of assets\n" % (total / 1048576.0))


if __name__ == "__main__":
    main()
