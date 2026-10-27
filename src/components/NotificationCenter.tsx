import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Smartphone,
  Volume2,
  Vibrate,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationCenterProps {
  permission: NotificationPermission;
  deviceToken: string;
  notificationsHistory: NotificationItem[];
  onRequestPermission: () => Promise<NotificationPermission>;
  onSendNotification: (params: {
    title: string;
    body: string;
    url?: string;
    delaySeconds?: number;
  }) => Promise<boolean>;
  onClearHistory: () => void;
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  permission,
  deviceToken,
  notificationsHistory,
  onRequestPermission,
  onSendNotification,
  onClearHistory,
  onClose,
}) => {
  const [title, setTitle] = useState('Studivo Announcement');
  const [message, setMessage] = useState('New study material and exam notice have been uploaded!');
  const [targetUrl, setTargetUrl] = useState('https://mantechion.alc.onl/studivo/app/dashboard.php');
  const [delay, setDelay] = useState(0);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'token'>('send');

  const presets = [
    {
      label: 'Exam Notice (परीक्षा सूचना)',
      title: 'Exam Date Sheet Published!',
      body: 'Mid-term examination schedule has been released on your Studivo portal.',
    },
    {
      label: 'New Homework (नया गृहकार्य)',
      title: 'New Assignment Added',
      body: 'Mathematics Chapter 5 problem set has been assigned by teacher.',
    },
    {
      label: 'Attendance (उपस्थिति)',
      title: 'Daily Attendance Marked',
      body: 'Your attendance for today has been recorded successfully.',
    },
    {
      label: 'Result Declared (परिणाम)',
      title: 'Report Card Available',
      body: 'Your term test marks and rank are now viewable in dashboard.',
    },
  ];

  const handleSend = async (delaySec: number = 0) => {
    setSending(true);
    await onSendNotification({
      title,
      body: message,
      url: targetUrl,
      delaySeconds: delaySec,
    });
    setSending(false);
  };

  const copyToken = () => {
    if (!deviceToken) return;
    navigator.clipboard.writeText(deviceToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/60 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Push Notification Center</h3>
            <p className="text-xs text-slate-400">
              Manage & send mobile notifications to Studivo users
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Permission Status Banner */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {permission === 'granted' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-medium">
                Notification Permission Active (सूचनाएं चालू हैं)
              </span>
            </>
          ) : permission === 'denied' ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-rose-300">
                Notifications Blocked in Browser Settings
              </span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-300">
                Permission Not Yet Requested
              </span>
            </>
          )}
        </div>

        {permission !== 'granted' && (
          <button
            onClick={onRequestPermission}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
          >
            Allow Notifications
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 gap-4">
        <button
          onClick={() => setActiveTab('send')}
          className={`py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'send'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Send Test Notification
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Notification History</span>
          {notificationsHistory.length > 0 && (
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full">
              {notificationsHistory.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`py-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'token'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Device Token (FCM / WebPush)
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 flex-1">
        {activeTab === 'send' && (
          <div className="space-y-4">
            {/* Quick Templates */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Quick Templates (शीघ्र सूचना प्रारूप):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTitle(preset.title);
                      setMessage(preset.body);
                    }}
                    className="text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-xs transition group"
                  >
                    <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition truncate">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {preset.body}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notification Title (शीर्षक)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Studivo Announcement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notification Message (संदेश)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="e.g. Assignment due tomorrow..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  On-Click URL (क्लिक करने पर खुलने वाला पेज)
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => handleSend(0)}
                disabled={sending}
                className="flex-1 min-w-[160px] bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send Now (तुरंत भेजें)</span>
              </button>

              <button
                onClick={() => handleSend(5)}
                disabled={sending}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition active:scale-95"
                title="Sends notification after 5 seconds so you can minimize the browser"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Test in 5 Seconds</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              💡 Tip: Click "Test in 5 Seconds" and minimize the browser or lock your screen to see the native Android banner & vibration!
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Recent Sent Notifications</span>
              {notificationsHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {notificationsHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No notifications sent yet. Use the "Send Test Notification" tab to test!
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {notificationsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3"
                  >
                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-200 text-xs truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      {item.url && (
                        <div className="text-[10px] text-blue-400/80 font-mono truncate mt-1">
                          {item.url}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'token' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                This Device's Push Token / Subscription
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Your PHP backend sends notifications to users using this unique device token.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative font-mono text-xs text-slate-300 break-all max-h-36 overflow-y-auto">
              {deviceToken || 'Loading device token...'}
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToken}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Token!' : 'Copy Device Token'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300">How to use with your website:</p>
              <p>
                1. When a student logs into <code className="text-blue-400">dashboard.php</code>, this token is sent to your MySQL database.
              </p>
              <p>
                2. When you want to send a notification, your PHP script sends the message to this token via Firebase or WebPush!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
