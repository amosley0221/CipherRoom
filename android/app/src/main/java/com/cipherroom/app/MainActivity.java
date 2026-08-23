package com.cipherroom.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.ServiceWorkerClientCompat;
import androidx.webkit.ServiceWorkerControllerCompat;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewFeature;

/**
 * The whole app: a WebView that serves the bundled copy of the Cipher Room web
 * app off {@code https://appassets.androidplatform.net/}.
 *
 * <p>Serving from a virtual https origin rather than {@code file://} matters —
 * the site links everything with root-absolute paths ({@code /app.jsx},
 * {@code /icons/…}), and only a real origin gives it a working localStorage,
 * which is where saved progress and the palette live.
 *
 * <p>Nothing is fetched from the network: {@code tools/build_web_assets.py}
 * vendors React, Babel, three.js and the webfonts into the assets directory at
 * build time.
 */
public class MainActivity extends Activity {

    private static final String TAG = "CipherRoom";
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final String START_URL = ORIGIN + "/index.html";
    private static final long BACK_TO_EXIT_WINDOW_MS = 2000L;

    private WebView webView;
    private long lastBackPress;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Service worker requests bypass WebViewClient, so they need the same
        // handler. index.html registers /sw.js, which is deliberately not
        // bundled (every asset is already local); this makes that registration
        // fail cleanly with a 404 instead of hanging on a DNS lookup.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(
                    new ServiceWorkerClientCompat() {
                        @Override
                        public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                            return assetLoader.shouldInterceptRequest(request.getUrl());
                        }
                    });
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0c1530"));
        webView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        // localStorage — the game reads "cipherTweaks" before first paint and
        // stores progress there.
        settings.setDomStorageEnabled(true);
        // Lets the ambient audio bed start from the game's own gesture handling
        // rather than waiting for a second, WebView-specific tap.
        settings.setMediaPlaybackRequiresUserGesture(false);
        // Everything is served through the asset loader; no direct file access.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        // The layout is a fixed typographic design; honouring the system font
        // scale on top of it overflows the puzzle panels.
        settings.setTextZoom(100);

        // The site ships six palettes of its own, one of them light ("bone"),
        // so let it decide: WebView's automatic darkening would invert it.
        // Older API levels are covered by android:forceDarkAllowed in
        // res/values-v29/themes.xml.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (ORIGIN.equals(url.getScheme() + "://" + url.getAuthority())) {
                    return false;
                }
                // Anything off-origin belongs in the user's browser, not here.
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url));
                } catch (ActivityNotFoundException e) {
                    Log.w(TAG, "No handler for " + url, e);
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                Log.d(TAG, message.message() + " (" + message.sourceId() + ":"
                        + message.lineNumber() + ")");
                return true;
            }
        });

        setContentView(webView);

        // restoreState returns null when there is no usable history (a cold
        // start, or a bundle that no longer holds WebView state), in which case
        // the page still has to be loaded by hand.
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Stops the three.js render loop and the audio bed while backgrounded.
        webView.onPause();
        webView.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.resumeTimers();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
            return;
        }
        // The game is a single page with no history, so a stray back press would
        // otherwise drop the player straight out of a chapter.
        long now = SystemClock.elapsedRealtime();
        if (now - lastBackPress < BACK_TO_EXIT_WINDOW_MS) {
            super.onBackPressed();
            return;
        }
        lastBackPress = now;
        Toast.makeText(this, R.string.back_again_to_exit, Toast.LENGTH_SHORT).show();
    }
}
