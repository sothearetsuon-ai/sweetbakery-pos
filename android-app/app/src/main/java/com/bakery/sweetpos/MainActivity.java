package com.bakery.sweetpos;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.media.MediaPlayer;
import android.media.AudioAttributes;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final String APP_URL = "https://appassets.androidplatform.net/index.html";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;
    private static final int CAMERA_PERMISSION_REQUEST_CODE = 2001;
    private static final int SPEECH_REQUEST_CODE = 3001;

    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout offlineLayout;
    private Button btnRetry;
    private WebViewAssetLoader assetLoader;

    private ValueCallback<Uri[]> uploadMessageCallback;
    private PermissionRequest pendingWebPermissionRequest;

    private TextToSpeech textToSpeech;
    private MediaPlayer mediaPlayer;

    // Standard Android In-App Update Engine
    private DownloadManager downloadManager;
    private long currentDownloadId = -1;
    private File pendingInstallFile = null;
    private BroadcastReceiver downloadCompleteReceiver;
    private ScheduledFuture<?> progressFuture;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Android TextToSpeech engine
        try {
            textToSpeech = new TextToSpeech(this, status -> {
                if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
                    textToSpeech.setLanguage(new Locale("km", "KH"));
                    textToSpeech.setSpeechRate(0.95f);
                    textToSpeech.setPitch(1.0f);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Initialize Android System DownloadManager
        downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
        setupDownloadCompleteReceiver();

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        offlineLayout = findViewById(R.id.offlineLayout);
        btnRetry = findViewById(R.id.btnRetry);

        // Pre-request camera permission so WebRTC live camera works instantly
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST_CODE);
        }

        // Hardware Acceleration and GPU-accelerated rendering
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        // Serve local bundled assets securely
        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/uploads/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        configureWebView();

        // Native bridge for In-App Updates and platform info
        webView.addJavascriptInterface(new SweetBakeryNativeBridge(), "SweetBakeryNative");

        btnRetry.setOnClickListener(v -> {
            offlineLayout.setVisibility(View.GONE);
            webView.loadUrl(APP_URL);
        });

        webView.loadUrl(APP_URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        webSettings.setEnableSmoothTransition(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true);
        webSettings.setUserAgentString(webSettings.getUserAgentString() + " SweetBakeryAndroidApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();

                // 1. First attempt with WebViewAssetLoader
                WebResourceResponse response = assetLoader.shouldInterceptRequest(uri);
                if (response != null) {
                    return response;
                }

                // 2. Direct high-speed local asset resolution for appassets.androidplatform.net
                String host = uri.getHost();
                if (host != null && (host.equals("appassets.androidplatform.net") || host.equals("localhost"))) {
                    String path = uri.getPath();
                    if (path != null) {
                        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
                        if (cleanPath.isEmpty()) cleanPath = "index.html";

                        try {
                            InputStream is = getAssets().open(cleanPath);
                            String mimeType = getMimeTypeForPath(cleanPath);
                            return new WebResourceResponse(mimeType, "UTF-8", is);
                        } catch (IOException e) {
                            // Instant 404 response to PREVENT 30-50s Android network timeout on missing/api paths!
                            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, null);
                        }
                    }
                }

                return null;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame() && !request.getUrl().toString().contains("appassets.androidplatform.net")) {
                    progressBar.setVisibility(View.GONE);
                    offlineLayout.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("https://appassets.androidplatform.net") || url.startsWith("file://")) {
                    return false;
                }
                // Open external links in device browser
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    return false;
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                WebView newWebView = new WebView(MainActivity.this);
                newWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return true;
                    }
                });
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    String[] resources = request.getResources();
                    boolean needsCamera = false;
                    boolean needsAudio = false;
                    for (String res : resources) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) needsCamera = true;
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) needsAudio = true;
                    }

                    boolean hasCamera = !needsCamera || ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
                    boolean hasAudio = !needsAudio || ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;

                    if (hasCamera && hasAudio) {
                        request.grant(resources);
                    } else {
                        pendingWebPermissionRequest = request;
                        List<String> perms = new ArrayList<>();
                        if (!hasCamera) perms.add(Manifest.permission.CAMERA);
                        if (!hasAudio) perms.add(Manifest.permission.RECORD_AUDIO);
                        ActivityCompat.requestPermissions(MainActivity.this, perms.toArray(new String[0]), CAMERA_PERMISSION_REQUEST_CODE);
                    }
                });
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingWebPermissionRequest != null && pendingWebPermissionRequest.equals(request)) {
                    pendingWebPermissionRequest = null;
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                            FileChooserParams fileChooserParams) {
                if (uploadMessageCallback != null) {
                    uploadMessageCallback.onReceiveValue(null);
                }
                uploadMessageCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (ActivityNotFoundException e) {
                    uploadMessageCallback = null;
                    Toast.makeText(MainActivity.this, "មិនអាចបើកកម្មវិធីជ្រើសរើសឯកសារបានឡើយ", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    private String getMimeTypeForPath(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".ttf")) return "font/ttf";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        return "application/octet-stream";
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (uploadMessageCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                uploadMessageCallback.onReceiveValue(results);
                uploadMessageCallback = null;
            }
        }
        if (requestCode == SPEECH_REQUEST_CODE) {
            if (resultCode == RESULT_OK && data != null) {
                ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty()) {
                    String recognizedText = matches.get(0);
                    String escaped = recognizedText.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ");
                    webView.evaluateJavascript("if (window.__onSweetBakerySpeechResult) window.__onSweetBakerySpeechResult('" + escaped + "');", null);
                } else {
                    webView.evaluateJavascript("if (window.__onSweetBakerySpeechError) window.__onSweetBakerySpeechError('no_speech');", null);
                }
            } else {
                webView.evaluateJavascript("if (window.__onSweetBakerySpeechError) window.__onSweetBakerySpeechError('cancelled');", null);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int res : grantResults) {
                if (res != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (allGranted && pendingWebPermissionRequest != null) {
                pendingWebPermissionRequest.grant(pendingWebPermissionRequest.getResources());
                pendingWebPermissionRequest = null;
            } else if (pendingWebPermissionRequest != null) {
                pendingWebPermissionRequest.deny();
                pendingWebPermissionRequest = null;
            }
        }
    }

    public class SweetBakeryNativeBridge {

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void openBrowser(String url) {
            if (url == null || url.trim().isEmpty()) return;
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "មិនអាចបើក Browser បានទេ", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void startSpeechRecognition() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "km-KH");
                    intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "សូមនិយាយសំណួររបស់អ្នក (Speak your question)...");
                    startActivityForResult(intent, SPEECH_REQUEST_CODE);
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "ឧបករណ៍នេះមិនទាន់មាន Google Voice Typing ទេ", Toast.LENGTH_SHORT).show();
                    webView.evaluateJavascript("if (window.__onSweetBakerySpeechError) window.__onSweetBakerySpeechError('not_supported');", null);
                }
            });
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.2.0";
            }
        }

        @JavascriptInterface
        public void speakKhmer(String text) {
            if (text == null || text.trim().isEmpty()) return;
            runOnUiThread(() -> {
                try {
                    if (textToSpeech != null) {
                        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "KHMER_PAYMENT_ALERT");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void playAudioUrl(String audioUrl) {
            if (audioUrl == null || audioUrl.trim().isEmpty()) return;
            Executors.newSingleThreadExecutor().execute(() -> {
                File tempAudioFile = null;
                try {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "🔔 KHQR Soundbox កំពុងប្រកាស...", Toast.LENGTH_SHORT).show();
                    });

                    // Download the speech audio file to local cache first (100% reliable)
                    URL url = new URL(audioUrl);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                    conn.setRequestProperty("Referer", "https://translate.google.com/");
                    conn.setConnectTimeout(10000);
                    conn.setReadTimeout(15000);

                    if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                        File cacheDir = getCacheDir();
                        tempAudioFile = new File(cacheDir, "soundbox_alert.mp3");
                        InputStream is = conn.getInputStream();
                        FileOutputStream fos = new FileOutputStream(tempAudioFile);
                        byte[] buffer = new byte[4096];
                        int read;
                        while ((read = is.read(buffer)) != -1) {
                            fos.write(buffer, 0, read);
                        }
                        fos.flush();
                        fos.close();
                        is.close();

                        // Now play the downloaded local mp3 with MediaPlayer
                        if (mediaPlayer != null) {
                            try {
                                mediaPlayer.stop();
                                mediaPlayer.release();
                            } catch (Exception ignored) {}
                            mediaPlayer = null;
                        }

                        mediaPlayer = new MediaPlayer();
                        mediaPlayer.setAudioAttributes(
                            new AudioAttributes.Builder()
                                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                                .build()
                        );
                        mediaPlayer.setDataSource(tempAudioFile.getAbsolutePath());
                        mediaPlayer.prepare();
                        mediaPlayer.start();
                    } else {
                        throw new IOException("HTTP " + conn.getResponseCode());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    // Play guaranteed bundled raw audio (R.raw.khqr_success)
                    runOnUiThread(() -> {
                        try {
                            if (mediaPlayer != null) {
                                try {
                                    mediaPlayer.stop();
                                    mediaPlayer.release();
                                } catch (Exception ignored) {}
                                mediaPlayer = null;
                            }
                            int resId = getResources().getIdentifier("khqr_success", "raw", getPackageName());
                            if (resId != 0) {
                                mediaPlayer = MediaPlayer.create(MainActivity.this, resId);
                                if (mediaPlayer != null) {
                                    mediaPlayer.start();
                                    return;
                                }
                            }
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }

                        if (textToSpeech != null) {
                            textToSpeech.speak("ទទួលបានប្រាក់តាមរយៈ KHQR ជោគជ័យ", TextToSpeech.QUEUE_FLUSH, null, "FALLBACK");
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void downloadAndInstallUpdate(String downloadUrl) {
            if (downloadUrl == null || downloadUrl.trim().isEmpty()) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "URL អាប់ដែតមិនត្រឹមត្រូវឡើយ", Toast.LENGTH_SHORT).show());
                return;
            }

            final String cleanUrl = downloadUrl.trim();

            runOnUiThread(() -> {
                Toast.makeText(MainActivity.this, "កំពុងទាញយកកំណែអាប់ដេតតាមរយៈប្រព័ន្ធ Android...", Toast.LENGTH_SHORT).show();
                webView.evaluateJavascript("window.onUpdateDownloadStart && window.onUpdateDownloadStart()", null);
            });

            // Use robust direct stream downloader with automatic 302/307 redirect resolution & live progress
            downloadViaDirectStream(cleanUrl);
        }

        @JavascriptInterface
        public String searchYouTube(String query) {
            if (query == null || query.trim().isEmpty()) {
                return "[]";
            }
            HttpURLConnection conn = null;
            try {
                String encodedQ = java.net.URLEncoder.encode(query.trim(), "UTF-8");
                URL url = new URL("https://www.youtube.com/results?search_query=" + encodedQ);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                conn.setRequestProperty("Accept-Language", "km,en;q=0.9");
                conn.setRequestProperty("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(12000);

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    InputStream is = conn.getInputStream();
                    java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                        if (sb.length() > 2500000) break;
                    }
                    reader.close();
                    is.close();

                    String html = sb.toString();
                    int startIdx = html.indexOf("ytInitialData = ");
                    if (startIdx != -1) {
                        startIdx += 16;
                    } else {
                        startIdx = html.indexOf("ytInitialData=");
                        if (startIdx != -1) startIdx += 14;
                    }

                    if (startIdx == -1) {
                        return "[]";
                    }

                    int endIdx = html.indexOf(";</script>", startIdx);
                    if (endIdx == -1) endIdx = html.indexOf("</script>", startIdx);
                    if (endIdx == -1) {
                        return "[]";
                    }

                    String jsonStr = html.substring(startIdx, endIdx).trim();
                    if (jsonStr.endsWith(";")) {
                        jsonStr = jsonStr.substring(0, jsonStr.length() - 1).trim();
                    }

                    org.json.JSONObject root = new org.json.JSONObject(jsonStr);
                    org.json.JSONObject contents = root.optJSONObject("contents");
                    if (contents != null) {
                        org.json.JSONObject twoCol = contents.optJSONObject("twoColumnSearchResultsRenderer");
                        if (twoCol != null) {
                            org.json.JSONObject primary = twoCol.optJSONObject("primaryContents");
                            if (primary != null) {
                                org.json.JSONObject sectionList = primary.optJSONObject("sectionListRenderer");
                                if (sectionList != null) {
                                    org.json.JSONArray sections = sectionList.optJSONArray("contents");
                                    org.json.JSONArray results = new org.json.JSONArray();
                                    if (sections != null) {
                                        for (int s = 0; s < sections.length(); s++) {
                                            org.json.JSONObject section = sections.optJSONObject(s);
                                            if (section == null) continue;
                                            org.json.JSONObject itemSection = section.optJSONObject("itemSectionRenderer");
                                            if (itemSection == null) continue;
                                            org.json.JSONArray items = itemSection.optJSONArray("contents");
                                            if (items == null) continue;
                                            for (int i = 0; i < items.length(); i++) {
                                                org.json.JSONObject it = items.optJSONObject(i);
                                                if (it == null) continue;
                                                org.json.JSONObject v = it.optJSONObject("videoRenderer");
                                                if (v != null && v.has("videoId")) {
                                                    String vid = v.optString("videoId");
                                                    String title = "";
                                                    org.json.JSONObject titleObj = v.optJSONObject("title");
                                                    if (titleObj != null) {
                                                        org.json.JSONArray runs = titleObj.optJSONArray("runs");
                                                        if (runs != null && runs.length() > 0) {
                                                            title = runs.optJSONObject(0).optString("text", "");
                                                        }
                                                    }
                                                    String author = "YouTube";
                                                    org.json.JSONObject ownerObj = v.optJSONObject("ownerText");
                                                    if (ownerObj != null) {
                                                        org.json.JSONArray runs = ownerObj.optJSONArray("runs");
                                                        if (runs != null && runs.length() > 0) {
                                                            author = runs.optJSONObject(0).optString("text", "YouTube");
                                                        }
                                                    }
                                                    String duration = "";
                                                    org.json.JSONObject lenObj = v.optJSONObject("lengthText");
                                                    if (lenObj != null) {
                                                        duration = lenObj.optString("simpleText", "");
                                                    }

                                                    org.json.JSONObject resItem = new org.json.JSONObject();
                                                    resItem.put("id", vid);
                                                    resItem.put("title", title);
                                                    resItem.put("author", author);
                                                    resItem.put("duration", duration);
                                                    resItem.put("thumbnailUrl", "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg");
                                                    resItem.put("url", "https://www.youtube.com/watch?v=" + vid);
                                                    results.put(resItem);
                                                    if (results.length() >= 30) break;
                                                }
                                            }
                                            if (results.length() >= 30) break;
                                        }
                                    }
                                    return results.toString();
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (conn != null) conn.disconnect();
            }
            return "[]";
        }

        @JavascriptInterface
        public String fetchYouTubePlaylist(String listId) {
            if (listId == null || listId.trim().isEmpty()) {
                return "[]";
            }
            HttpURLConnection conn = null;
            try {
                String cleanList = listId.trim();
                URL url = new URL("https://www.youtube.com/playlist?list=" + java.net.URLEncoder.encode(cleanList, "UTF-8"));
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                conn.setRequestProperty("Accept-Language", "km,en;q=0.9");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(12000);

                if (conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
                    InputStream is = conn.getInputStream();
                    java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                        if (sb.length() > 2500000) break;
                    }
                    reader.close();
                    is.close();

                    String html = sb.toString();
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"videoId\":\"([a-zA-Z0-9_-]{11})\"");
                    java.util.regex.Matcher matcher = pattern.matcher(html);
                    java.util.Set<String> seen = new java.util.LinkedHashSet<>();
                    while (matcher.find()) {
                        seen.add(matcher.group(1));
                        if (seen.size() >= 50) break;
                    }

                    org.json.JSONArray results = new org.json.JSONArray();
                    for (String vid : seen) {
                        org.json.JSONObject resItem = new org.json.JSONObject();
                        resItem.put("id", vid);
                        resItem.put("title", "YouTube Video (" + vid + ")");
                        resItem.put("author", "YouTube Playlist");
                        resItem.put("thumbnailUrl", "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg");
                        resItem.put("url", "https://www.youtube.com/watch?v=" + vid);
                        results.put(resItem);
                    }
                    return results.toString();
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (conn != null) conn.disconnect();
            }
            return "[]";
        }
    }

    private void setupDownloadCompleteReceiver() {
        downloadCompleteReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (id != -1 && id == currentDownloadId) {
                        checkDownloadStatusAndInstall(id);
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(downloadCompleteReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            registerReceiver(downloadCompleteReceiver, filter);
        }
    }

    private void checkDownloadStatusAndInstall(long downloadId) {
        if (progressFuture != null) {
            progressFuture.cancel(false);
        }
        try {
            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(downloadId);
            Cursor cursor = downloadManager.query(query);
            if (cursor != null && cursor.moveToFirst()) {
                int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                int status = statusIndex != -1 ? cursor.getInt(statusIndex) : DownloadManager.STATUS_FAILED;
                cursor.close();

                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    File apkFile = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "SweetBakery-Update.apk");
                    runOnUiThread(() -> {
                        Toast.makeText(this, "ទាញយករួចរាល់! កំពុងបើកកម្មវិធីដំឡើង...", Toast.LENGTH_SHORT).show();
                        webView.evaluateJavascript("window.onUpdateDownloadProgress && window.onUpdateDownloadProgress(100)", null);
                        webView.evaluateJavascript("window.onUpdateDownloadComplete && window.onUpdateDownloadComplete()", null);
                    });
                    installApk(apkFile);
                } else {
                    runOnUiThread(() -> {
                        Toast.makeText(this, "ការទាញយកមិនជោគជ័យឡើយ", Toast.LENGTH_LONG).show();
                        webView.evaluateJavascript("window.onUpdateDownloadError && window.onUpdateDownloadError('Download failed')", null);
                    });
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startProgressPolling(long downloadId) {
        if (progressFuture != null && !progressFuture.isDone()) {
            progressFuture.cancel(true);
        }

        progressFuture = scheduler.scheduleWithFixedDelay(() -> {
            try {
                DownloadManager.Query q = new DownloadManager.Query();
                q.setFilterById(downloadId);
                Cursor c = downloadManager.query(q);
                if (c != null && c.moveToFirst()) {
                    int bytesDownloadedCol = c.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
                    int totalCol = c.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
                    int statusCol = c.getColumnIndex(DownloadManager.COLUMN_STATUS);

                    int downloaded = bytesDownloadedCol != -1 ? c.getInt(bytesDownloadedCol) : 0;
                    int total = totalCol != -1 ? c.getInt(totalCol) : 0;
                    int status = statusCol != -1 ? c.getInt(statusCol) : 0;
                    c.close();

                    if (total > 0) {
                        final int progress = (int) ((downloaded * 100L) / total);
                        runOnUiThread(() -> {
                            webView.evaluateJavascript("window.onUpdateDownloadProgress && window.onUpdateDownloadProgress(" + progress + ")", null);
                        });
                    }

                    if (status == DownloadManager.STATUS_SUCCESSFUL || status == DownloadManager.STATUS_FAILED) {
                        if (progressFuture != null) progressFuture.cancel(false);
                    }
                }
            } catch (Exception ignored) {}
        }, 200, 300, TimeUnit.MILLISECONDS);
    }

    private void downloadViaDirectStream(String downloadUrl) {
        Executors.newSingleThreadExecutor().execute(() -> {
            File outputFile = null;
            try {
                File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir == null) dir = getCacheDir();
                outputFile = new File(dir, "SweetBakery-Update.apk");
                if (outputFile.exists()) {
                    outputFile.delete();
                }

                URL currentUrl = new URL(downloadUrl);
                HttpURLConnection connection = null;
                int responseCode = 0;
                int redirectCount = 0;

                while (redirectCount < 6) {
                    connection = (HttpURLConnection) currentUrl.openConnection();
                    connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) SweetBakeryApp/1.0");
                    connection.setConnectTimeout(25000);
                    connection.setReadTimeout(60000);
                    connection.setInstanceFollowRedirects(true);
                    connection.connect();

                    responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                        responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                        responseCode == HttpURLConnection.HTTP_SEE_OTHER ||
                        responseCode == 307 || responseCode == 308) {
                        String newUrl = connection.getHeaderField("Location");
                        if (newUrl != null && !newUrl.isEmpty()) {
                            currentUrl = new URL(newUrl);
                            redirectCount++;
                            continue;
                        }
                    }
                    break;
                }

                if (responseCode != HttpURLConnection.HTTP_OK) {
                    final int finalResponseCode = responseCode;
                    final String errMsg = "Download failed: Server returned HTTP " + finalResponseCode;
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "ការទាញយកបានបរាជ័យ (HTTP " + finalResponseCode + ")", Toast.LENGTH_LONG).show();
                        webView.evaluateJavascript("window.onUpdateDownloadError && window.onUpdateDownloadError('" + errMsg + "')", null);
                    });
                    return;
                }

                int fileLength = connection.getContentLength();
                InputStream input = connection.getInputStream();
                FileOutputStream output = new FileOutputStream(outputFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;
                long lastReportTime = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    long now = System.currentTimeMillis();
                    if (fileLength > 0 && (now - lastReportTime > 250)) {
                        lastReportTime = now;
                        final int progress = (int) (total * 100 / fileLength);
                        runOnUiThread(() -> {
                            webView.evaluateJavascript("window.onUpdateDownloadProgress && window.onUpdateDownloadProgress(" + progress + ")", null);
                        });
                    }
                }

                output.flush();
                output.close();
                input.close();

                final File finalFile = outputFile;
                runOnUiThread(() -> {
                    webView.evaluateJavascript("window.onUpdateDownloadComplete && window.onUpdateDownloadComplete()", null);
                    installApk(finalFile);
                });

            } catch (Exception e) {
                final String err = e.getMessage() != null ? e.getMessage() : "Unknown error";
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, "កំហុសពេលទាញយក: " + err, Toast.LENGTH_LONG).show();
                    webView.evaluateJavascript("window.onUpdateDownloadError && window.onUpdateDownloadError('" + err.replace("'", "\\'") + "')", null);
                });
            }
        });
    }

    private void installApk(File apkFile) {
        if (apkFile == null || !apkFile.exists()) {
            runOnUiThread(() -> Toast.makeText(this, "រកមិនឃើញឯកសារអាប់ដេតឡើយ", Toast.LENGTH_SHORT).show());
            return;
        }

        pendingInstallFile = apkFile;

        runOnUiThread(() -> {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    if (!getPackageManager().canRequestPackageInstalls()) {
                        Toast.makeText(this, "សូមបើកសិទ្ធិ «អនុញ្ញាតពីប្រភពនេះ» ដើម្បីបន្តការដំឡើង", Toast.LENGTH_LONG).show();
                        Intent permIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                        permIntent.setData(Uri.parse("package:" + getPackageName()));
                        startActivity(permIntent);
                        return;
                    }
                }

                Uri apkUri = FileProvider.getUriForFile(
                        this,
                        getPackageName() + ".provider",
                        apkFile
                );

                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                pendingInstallFile = null;
            } catch (Exception e) {
                e.printStackTrace();
                Toast.makeText(this, "មិនអាចបើកកម្មវិធីដំឡើងបានទេ: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pendingInstallFile != null && pendingInstallFile.exists()) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getPackageManager().canRequestPackageInstalls()) {
                File toInstall = pendingInstallFile;
                pendingInstallFile = null;
                installApk(toInstall);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (progressFuture != null) {
            try {
                progressFuture.cancel(true);
            } catch (Exception ignored) {}
        }
        if (downloadCompleteReceiver != null) {
            try {
                unregisterReceiver(downloadCompleteReceiver);
            } catch (Exception ignored) {}
        }
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception ignored) {}
        }
        if (mediaPlayer != null) {
            try {
                mediaPlayer.stop();
                mediaPlayer.release();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
