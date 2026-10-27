import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Bell,
  Download,
  Server,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { MobileAppView } from './components/MobileAppView';
import { NotificationCenter } from './components/NotificationCenter';
import { PhpBackendGuide } from './components/PhpBackendGuide';
import { ApkGeneratorModal } from './components/ApkGeneratorModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { usePushNotifications } from './hooks/usePushNotifications';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<'app' | 'notifications' | 'php'>('app');
  const [showApkModal, setShowApkModal] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://mantechion.alc.onl/studivo/app/dashboard.php');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const {
    permission,
    deviceToken,
    notificationsHistory,
    requestPermission,
    sendPushNotification,
    clearHistory,
  } = usePushNotifications();

  const { isInstallable, install } = usePWAInstall();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Branded Splash Screen on App Load */}
      {showSplash && (
        <SplashScreen
          duration={2200}
          onFinish={() => setShowSplash(false)}
          interactive={true}
        />
      )}

      {/* PWA Install Banner */}
      <PWAInstallBanner onOpenApkModal={() => setShowApkModal(true)} />

      {/* Global Navigation Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setShowSplash(true)} title="Replay Splash Screen">
              <img
                src="/icon-512.png"
                alt="Studivo Logo"
                className="w-9 h-9 rounded-xl bg-white p-1 shadow-md object-contain transition group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base tracking-tight leading-none">
                  Studivo
                </h1>
                <span className="text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Android App & Push Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Studivo by Mantechion
              </p>
            </div>
          </div>

          {/* Quick Tabs in Header */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('app')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeView === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android App</span>
            </button>

            <button
              onClick={() => setActiveView('notifications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeView === 'notifications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Push Notification Center</span>
              {notificationsHistory.length > 0 && (
                <span className="bg-blue-500/30 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {notificationsHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('php')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeView === 'php'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>PHP Backend Code</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSplash(true)}
              title="Preview Android Splash Screen"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span>Splash</span>
            </button>

            <button
              onClick={() => setShowApkModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-lg transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Build APK / Project</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs mt-2.5">
          <button
            onClick={() => setActiveView('app')}
            className={`flex-1 py-1.5 text-center font-medium rounded-lg transition ${
              activeView === 'app' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            📱 App
          </button>
          <button
            onClick={() => setActiveView('notifications')}
            className={`flex-1 py-1.5 text-center font-medium rounded-lg transition ${
              activeView === 'notifications' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveView('php')}
            className={`flex-1 py-1.5 text-center font-medium rounded-lg transition ${
              activeView === 'php' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            💻 PHP Setup
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {activeView === 'app' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Quick Controls & Info */}
            <div className="lg:col-span-4 space-y-4">
              {/* App Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                    <img src="/icon-512.png" alt="Studivo Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Studivo by Mantechion</h3>
                    <p className="text-xs text-blue-400 font-mono">com.mantechion.studivo</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Your website has been packaged into an Android app with native splash screen, pull-to-refresh, hardware acceleration, and full push notification support!
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Website URL:</span>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[170px]"
                    >
                      <span>dashboard.php</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Mobile Push:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active (FCM & WebPush)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>App Platform:</span>
                    <span className="text-slate-200">Android APK & PWA</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => setShowApkModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold p-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition active:scale-95 text-sm animate-pulse"
                  >
                    <Download className="w-5 h-5" />
                    <span>📥 Download Studivo APK (यहाँ क्लिक करें)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveView('notifications')}
                      className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Test Push</span>
                    </button>

                    <button
                      onClick={() => setShowApkModal(true)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Install Guide</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Notification Sender on Left Side */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Send Quick Notification (तुरंत नोटिफिकेशन)
                  </span>
                  <span className="text-[10px] text-slate-400">Live Device Test</span>
                </div>

                <button
                  onClick={() =>
                    sendPushNotification({
                      title: 'Studivo: नई परीक्षा तिथि घोषित!',
                      body: 'Examination timetable is now uploaded on your dashboard.',
                    })
                  }
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                    📢 Exam Schedule Alert
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    "Examination timetable is now uploaded on your dashboard."
                  </div>
                </button>

                <button
                  onClick={() =>
                    sendPushNotification({
                      title: 'Studivo: नया गृहकार्य मिला',
                      body: 'Mathematics Chapter 4 problems are due by tomorrow 5 PM.',
                    })
                  }
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition group"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                    📚 Homework Assignment Alert
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    "Mathematics Chapter 4 problems are due by tomorrow."
                  </div>
                </button>

                <p className="text-[11px] text-slate-500">
                  Clicking sends an authentic system notification banner directly to your phone/PC!
                </p>
              </div>
            </div>

            {/* Right Column: Android Phone Device Simulator */}
            <div className="lg:col-span-8 flex justify-center">
              <MobileAppView
                targetUrl={targetUrl}
                onOpenNotifications={() => setActiveView('notifications')}
                unreadCount={notificationsHistory.length}
              />
            </div>
          </div>
        )}

        {activeView === 'notifications' && (
          <div className="py-2">
            <NotificationCenter
              permission={permission}
              deviceToken={deviceToken}
              notificationsHistory={notificationsHistory}
              onRequestPermission={requestPermission}
              onSendNotification={sendPushNotification}
              onClearHistory={clearHistory}
            />
          </div>
        )}

        {activeView === 'php' && (
          <div className="py-2">
            <PhpBackendGuide />
          </div>
        )}
      </main>

      {/* APK Generator & Download Modal */}
      <ApkGeneratorModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        targetUrl={targetUrl}
        isInstallable={isInstallable}
        onPwaInstall={install}
      />

      {/* Offline Status Warning Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-bounce">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>Offline Mode — Using cached Studivo data.</span>
        </div>
      )}
    </div>
  );
}
