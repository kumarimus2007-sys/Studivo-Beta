import React, { useState } from 'react';
import { Code2, Copy, Check, Server, Database, Send, FileCode2, Sparkles } from 'lucide-react';

export const PhpBackendGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlSchema = `-- Run this in your MySQL database (phpMyAdmin / cPanel)
CREATE TABLE IF NOT EXISTS \`studivo_device_tokens\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` VARCHAR(100) NULL,
  \`device_token\` TEXT NOT NULL,
  \`device_type\` VARCHAR(20) DEFAULT 'android',
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`unique_token\` (\`device_token\`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const saveTokenPhp = `<?php
/**
 * File: save_device_token.php
 * Place this in: /studivo/app/api/save_device_token.php
 * Called automatically by Studivo Android App / Webview
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// Include your existing DB connection
// require_once '../config/db.php';

// Example PDO connection:
$dbHost = 'localhost';
$dbName = 'your_database_name';
$dbUser = 'your_db_username';
$dbPass = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$deviceToken = $input['device_token'] ?? $_POST['device_token'] ?? '';
$userId = $input['user_id'] ?? $_POST['user_id'] ?? null;

if (empty($deviceToken)) {
    echo json_encode(['success' => false, 'error' => 'Device token required']);
    exit;
}

// Insert or update token in database
$stmt = $pdo->prepare("
    INSERT INTO studivo_device_tokens (user_id, device_token, device_type) 
    VALUES (:user_id, :device_token, 'android')
    ON DUPLICATE KEY UPDATE 
    user_id = VALUES(user_id), 
    updated_at = CURRENT_TIMESTAMP
");

$success = $stmt->execute([
    ':user_id' => $userId,
    ':device_token' => $deviceToken
]);

echo json_encode(['success' => $success, 'message' => 'Device token saved successfully']);
?>`;

  const sendNotificationPhp = `<?php
/**
 * File: send_notification.php
 * Place this in your PHP backend (/studivo/app/send_notification.php)
 * Call this function whenever you publish an exam, homework, or alert!
 */

// 1. Your Firebase Server Key (Get from Firebase Console -> Project Settings -> Cloud Messaging)
define('FCM_SERVER_KEY', 'PASTE_YOUR_FIREBASE_SERVER_KEY_HERE');

function sendStudivoPushNotification($tokens, $title, $message, $targetUrl = 'https://mantechion.alc.onl/studivo/app/dashboard.php') {
    $url = 'https://fcm.googleapis.com/fcm/send';

    // $tokens can be a single token string OR an array of tokens (broadcast)
    $payload = [
        'notification' => [
            'title' => $title,
            'body' => $message,
            'sound' => 'default',
            'icon' => 'ic_launcher'
        ],
        'data' => [
            'url' => $targetUrl,
            'title' => $title,
            'body' => $message,
            'timestamp' => time()
        ],
        'priority' => 'high'
    ];

    if (is_array($tokens)) {
        $payload['registration_ids'] = $tokens; // Send to up to 1000 users at once!
    } else {
        $payload['to'] = $tokens; // Single user
    }

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
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

// Example: Send broadcast to all students from dashboard.php
// $allTokens = $pdo->query("SELECT device_token FROM studivo_device_tokens")->fetchAll(PDO::FETCH_COLUMN);
// $result = sendStudivoPushNotification($allTokens, 'New Homework Added', 'Math Chapter 3 exercise is now available.');
?>`;

  const dashboardJsSnippet = `<!-- Add this small snippet into your dashboard.php before </body> -->
<script>
// Check if user is in Studivo Android App or PWA
function registerStudivoNotification(token, userId) {
    fetch('/studivo/app/api/save_device_token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_token: token, user_id: userId })
    }).then(res => res.json()).then(data => console.log('Studivo push registered:', data));
}

// Receive token from Android Native Bridge or Service Worker
if (window.StudivoApp) {
    console.log("Running in Studivo Android App v" + window.StudivoApp.getAppVersion());
}

// Auto register token callback
window.onFirebaseTokenReceived = function(token) {
    console.log("Received FCM Token:", token);
    registerStudivoNotification(token, "<?php echo $_SESSION['user_id'] ?? 'guest'; ?>");
};
</script>`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-3xl w-full mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>PHP Website & Push Notification Setup Guide</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
              PHP + MySQL + FCM
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Copy-paste these 3 files into your <code className="text-indigo-300">dashboard.php</code> backend to send live notifications to all app users!
          </p>
        </div>
      </div>

      {/* Step 1: MySQL Database Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">1</span>
            MySQL Table: <code className="text-blue-400 text-xs">studivo_device_tokens</code>
          </span>
          <button
            onClick={() => handleCopy('sql', sqlSchema)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sql' ? 'Copied SQL' : 'Copy SQL'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
          {sqlSchema}
        </pre>
      </div>

      {/* Step 2: Save Token PHP Endpoint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">2</span>
            API Script: <code className="text-emerald-400 text-xs">save_device_token.php</code>
          </span>
          <button
            onClick={() => handleCopy('save', saveTokenPhp)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            {copiedKey === 'save' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'save' ? 'Copied PHP' : 'Copy PHP'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
          {saveTokenPhp}
        </pre>
      </div>

      {/* Step 3: Send Notification PHP Script */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">3</span>
            Broadcast Function: <code className="text-amber-400 text-xs">send_notification.php</code>
          </span>
          <button
            onClick={() => handleCopy('send', sendNotificationPhp)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            {copiedKey === 'send' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'send' ? 'Copied PHP' : 'Copy PHP'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
          {sendNotificationPhp}
        </pre>
      </div>

      {/* Step 4: Include in dashboard.php */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-mono">4</span>
            Client Bridge in <code className="text-purple-400 text-xs">dashboard.php</code>
          </span>
          <button
            onClick={() => handleCopy('bridge', dashboardJsSnippet)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            {copiedKey === 'bridge' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'bridge' ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-40">
          {dashboardJsSnippet}
        </pre>
      </div>
    </div>
  );
};
