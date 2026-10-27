import JSZip from 'jszip';

export async function generateAndroidStudioProjectZip(targetUrl: string = 'https://mantechion.alc.onl/studivo/app/dashboard.php') {
  const zip = new JSZip();

  // Root project files
  zip.file(
    'settings.gradle',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Studivo"
include ':app'
`
  );

  zip.file(
    'build.gradle',
    `plugins {
    id 'com.android.application' version '8.2.2' apply false
    id 'com.google.gms.google-services' version '4.4.1' apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
`
  );

  // App module
  zip.file(
    'app/build.gradle',
    `plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

android {
    namespace 'com.mantechion.studivo'
    compileSdk 34

    defaultConfig {
        applicationId "com.mantechion.studivo"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.core:core:1.12.0'
    
    // Firebase Cloud Messaging (Push Notifications)
    implementation platform('com.google.firebase:firebase-bom:32.7.4')
    implementation 'com.google.firebase:firebase-messaging'
}
`
  );

  // AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions required for webview and push notifications -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.Studivo"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        tools:targetApi="34">

        <!-- Splash Activity -->
        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.Studivo.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Main WebView Activity -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true"
            android:windowSoftInputMode="adjustResize" />

        <!-- Firebase Cloud Messaging Notification Service -->
        <service
            android:name=".MyFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

    </application>

</manifest>
`
  );

  // Java files
  const javaPkg = 'app/src/main/java/com/mantechion/studivo';

  // SplashActivity.java
  zip.file(
    `${javaPkg}/SplashActivity.java`,
    `package com.mantechion.studivo;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        // Auto transition to MainActivity after 2 seconds
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent intent = new Intent(SplashActivity.this, MainActivity.class);
            // Forward notification intent extras if app opened via push notification
            if (getIntent().getExtras() != null) {
                intent.putExtras(getIntent().getExtras());
            }
            startActivity(intent);
            finish();
        }, 2200);
    }
}
`
  );

  // MainActivity.java
  zip.file(
    `${javaPkg}/MainActivity.java`,
    `package com.mantechion.studivo;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends AppCompatActivity {

    public static final String DEFAULT_URL = "${targetUrl}";
    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private ValueCallback<Uri[]> uploadMessage;
    private static final int REQUEST_SELECT_FILE = 100;
    private static final int PERMISSION_REQUEST_CODE = 101;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);

        requestNotificationPermission();
        setupWebView();
        fetchFirebaseToken();

        // Handle target URL if passed via notification
        String loadUrl = DEFAULT_URL;
        if (getIntent() != null && getIntent().hasExtra("target_url")) {
            loadUrl = getIntent().getStringExtra("target_url");
        }

        webView.loadUrl(loadUrl);

        // Pull to refresh
        swipeRefreshLayout.setOnRefreshListener(() -> webView.reload());

        // Back button navigation inside webview
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, PERMISSION_REQUEST_CODE);
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " StudivoAndroidApp/1.0");

        // JavaScript interface to interact with PHP webpage
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showToast(String msg) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
            }

            @JavascriptInterface
            public String getAppVersion() {
                return "1.0.0";
            }
        }, "StudivoApp");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Stay within studivo domain
                if (url.contains("mantechion.alc.onl") || url.contains("dashboard.php")) {
                    return false;
                }
                // External links (whatsapp, tel, mailto, etc.)
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                swipeRefreshLayout.setRefreshing(false);
                progressBar.setVisibility(View.GONE);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }

            // Support <input type="file"> inside dashboard.php
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                }
                uploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, REQUEST_SELECT_FILE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }
        });
    }

    private void fetchFirebaseToken() {
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    return;
                }
                String token = task.getResult();
                // Inject token into PHP webpage so backend can save it in DB
                webView.post(() -> {
                    webView.evaluateJavascript(
                        "if(typeof window.onFirebaseTokenReceived === 'function'){ window.onFirebaseTokenReceived('" + token + "'); }",
                        null
                    );
                });
            });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SELECT_FILE) {
            if (uploadMessage != null) {
                uploadMessage.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                uploadMessage = null;
            }
        }
    }
}
`
  );

  // MyFirebaseMessagingService.java
  zip.file(
    `${javaPkg}/MyFirebaseMessagingService.java`,
    `package com.mantechion.studivo;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "studivo_alerts_channel";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        String title = "Studivo Notification";
        String body = "You have a new update in Studivo!";
        String targetUrl = MainActivity.DEFAULT_URL;

        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                title = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                body = remoteMessage.getNotification().getBody();
            }
        }

        if (remoteMessage.getData().size() > 0) {
            if (remoteMessage.getData().containsKey("title")) {
                title = remoteMessage.getData().get("title");
            }
            if (remoteMessage.getData().containsKey("body")) {
                body = remoteMessage.getData().get("body");
            }
            if (remoteMessage.getData().containsKey("url")) {
                targetUrl = remoteMessage.getData().get("url");
            }
        }

        sendNotification(title, body, targetUrl);
    }

    @Override
    public void onNewToken(@NonNull String token) {
        // Send new token to server / logs
        super.onNewToken(token);
    }

    private void sendNotification(String title, String body, String targetUrl) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("target_url", targetUrl);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(R.mipmap.ic_launcher)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setAutoCancel(true)
                        .setSound(defaultSoundUri)
                        .setVibrate(new long[]{200, 100, 200, 100, 200})
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Studivo Announcements",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notifications for Studivo exams, homework, and announcements");
            channel.enableVibration(true);
            notificationManager.createNotificationChannel(channel);
        }

        notificationManager.notify((int) System.currentTimeMillis(), notificationBuilder.build());
    }
}
`
  );

  // Layouts
  zip.file(
    'app/src/main/res/layout/activity_main.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:indeterminate="false"
        android:max="100"
        android:progressDrawable="@drawable/progress_bar_custom"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent" />

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintTop_toBottomOf="@id/progressBar">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

</androidx.constraintlayout.widget.ConstraintLayout>
`
  );

  zip.file(
    'app/src/main/res/layout/activity_splash.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FFFFFF"
    android:gravity="center"
    android:orientation="vertical"
    android:padding="24dp">

    <ImageView
        android:layout_width="160dp"
        android:layout_height="160dp"
        android:src="@drawable/logo"
        android:contentDescription="Studivo Logo" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:fontFamily="serif"
        android:text="Studivo By"
        android:textColor="#0F172A"
        android:textSize="32sp"
        android:textStyle="bold" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="serif"
        android:text="Mantechion"
        android:textColor="#0F172A"
        android:textSize="32sp"
        android:textStyle="bold" />

    <ProgressBar
        android:layout_width="32dp"
        android:layout_height="32dp"
        android:layout_marginTop="36dp"
        android:indeterminate="true" />

</LinearLayout>
`
  );

  // Resource values
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">Studivo</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#1E40AF</color>
    <color name="primary_dark">#1E3A8A</color>
    <color name="accent">#3B82F6</color>
    <color name="white">#FFFFFF</color>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <style name="Theme.Studivo" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryVariant">@color/primary_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="android:statusBarColor">@color/white</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>

    <style name="Theme.Studivo.Splash" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/white</item>
        <item name="android:statusBarColor">@color/white</item>
        <item name="android:windowLightStatusBar">true</item>
    </style>
</resources>
`
  );

  zip.file(
    'app/src/main/res/drawable/progress_bar_custom.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@android:id/progress">
        <clip>
            <shape>
                <solid android:color="#2563EB" />
            </shape>
        </clip>
    </item>
</layer-list>
`
  );

  zip.file(
    'app/src/main/res/xml/backup_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
</full-backup-content>
`
  );

  zip.file(
    'app/src/main/res/xml/data_extraction_rules.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="root" />
    </cloud-backup>
</data-extraction-rules>
`
  );

  // README with clear step-by-step instructions
  zip.file(
    'README.md',
    `# Studivo Android App (Ready for Android Studio)

Built for: https://mantechion.alc.onl/studivo/app/dashboard.php
Brand: Studivo By Mantechion

## 🚀 How to Build APK in 2 Minutes:

### Option 1: Android Studio (Recommended)
1. Extract this zip file.
2. Open Android Studio.
3. Click **File > Open** and select this extracted folder.
4. Wait for Gradle sync to complete.
5. In the top menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio will generate \`app-debug.apk\` in \`app/build/outputs/apk/debug/\`.
7. Transfer this APK to your Android phone and install!

### 🔔 Firebase Push Notifications Setup:
1. Go to https://console.firebase.google.com and create a project.
2. Add an Android app with package name: \`com.mantechion.studivo\`.
3. Download \`google-services.json\` from Firebase.
4. Place \`google-services.json\` into the \`app/\` folder of this project.
5. In your PHP server (\`dashboard.php\`), send push notifications using the FCM HTTP v1 API or Legacy FCM key.

### Option 2: 1-Click TWA / Bubblewrap APK (No Android Studio required):
Run this in terminal:
\`\`\`bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://mantechion.alc.onl/studivo/manifest.json"
bubblewrap build
\`\`\`
`
  );

  // PHP Server notification files
  zip.file(
    'php_backend/send_notification.php',
    `<?php
/**
 * Studivo Push Notification Sender Script for PHP Backend
 * Place this in your PHP backend server to send notifications to Android users
 */

// Your Firebase Server Key or HTTP v1 Bearer Token
define('FCM_SERVER_KEY', 'YOUR_FIREBASE_SERVER_KEY_HERE');

function sendStudivoPushNotification($deviceToken, $title, $body, $targetUrl = 'https://mantechion.alc.onl/studivo/app/dashboard.php') {
    $url = 'https://fcm.googleapis.com/fcm/send';

    $fields = [
        'to' => $deviceToken,
        'priority' => 'high',
        'notification' => [
            'title' => $title,
            'body' => $body,
            'icon' => 'ic_launcher',
            'sound' => 'default',
            'click_action' => 'OPEN_STUDIVO_DASHBOARD'
        ],
        'data' => [
            'url' => $targetUrl,
            'title' => $title,
            'body' => $body
        ]
    ];

    $headers = [
        'Authorization: key=' . FCM_SERVER_KEY,
        'Content-Type: application/json'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $httpCode,
        'response' => json_decode($result, true)
    ];
}

// Example usage:
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['device_token'] ?? '';
    $title = $_POST['title'] ?? 'Studivo Announcement';
    $message = $_POST['message'] ?? 'Check your dashboard for new assignments.';

    if (!empty($token)) {
        $result = sendStudivoPushNotification($token, $title, $message);
        echo json_encode($result);
    }
}
?>`
  );

  return zip.generateAsync({ type: 'blob' });
}
