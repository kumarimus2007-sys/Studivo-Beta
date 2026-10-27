import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Terminal,
  FolderArchive,
  Layers,
  Sparkles,
  FileCode,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAndroidStudioProjectZip } from '../utils/androidProjectZip';

interface ApkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  isInstallable: boolean;
  onPwaInstall: () => Promise<boolean>;
}

export const ApkGeneratorModal: React.FC<ApkGeneratorModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  isInstallable,
  onPwaInstall,
}) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'pwa' | 'cli'>('studio');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zipBlob = await generateAndroidStudioProjectZip(targetUrl);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Studivo-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (e) {
      console.error('Failed to generate project zip', e);
      alert('Error generating Android project zip');
    } finally {
      setDownloadingZip(false);
    }
  };

  const bubblewrapCommand = `# 1. Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize project from your Studivo manifest
bubblewrap init --manifest="https://mantechion.alc.onl/studivo/manifest.json"

# 3. Build signed APK or Android App Bundle (AAB)
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Android APK Builder & Source Code</span>
                <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  v1.0.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose how you want to build or install your Studivo Android app
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-6">
          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Android Studio Project (.ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pwa'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instant Mobile Install (WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'cli'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CLI / TWA Tool</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/40 border border-blue-800/40 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200 leading-relaxed">
                  <strong className="text-white">Complete Native Source Code:</strong> We have compiled your entire Android Studio project containing <code className="text-blue-300">MainActivity.java</code>, <code className="text-blue-300">MyFirebaseMessagingService.java</code> (Push Notifications), <code className="text-blue-300">SplashActivity.java</code> with your logo, Gradle configs, and AndroidManifest!
                </div>
              </div>

              {/* App Summary Card */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Package Name</span>
                  <span className="font-mono text-slate-200 font-semibold">com.mantechion.studivo</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Push Notification System</span>
                  <span className="font-mono text-emerald-400 font-semibold">Firebase (FCM) + WebPush</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Splash Screen</span>
                  <span className="font-mono text-blue-400 font-semibold">Studivo By Mantechion</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Target Website URL</span>
                  <span className="font-mono text-slate-300 truncate block">{targetUrl}</span>
                </div>
              </div>

              {/* Download Action */}
              <div className="pt-2">
                <button
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition active:scale-95 disabled:opacity-50 text-sm"
                >
                  {downloadingZip ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Android Project ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Android Studio Project (.ZIP)</span>
                    </>
                  )}
                </button>

                {downloadSuccess && (
                  <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Project ZIP downloaded! Unzip and open in Android Studio to build your APK!</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-300">
                <p className="font-semibold text-white">How to compile APK in Android Studio:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Extract the downloaded zip file on your PC/laptop.</li>
                  <li>Open Android Studio and click <strong className="text-slate-200">Open</strong> &gt; select the folder.</li>
                  <li>Wait 1 minute for Gradle to sync dependencies.</li>
                  <li>Click <strong className="text-slate-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
                  <li>Done! You will get your <strong className="text-slate-200">app-debug.apk</strong> ready to install on any Android mobile!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl text-xs text-emerald-200 leading-relaxed">
                <strong className="text-white block mb-1">⚡ Instant WebAPK (No Android Studio Needed):</strong>
                You can install this app directly on any Android phone (via Chrome / Samsung Internet) right now! It installs like a native app with the Studivo logo on the phone's home screen, full-screen view, and real-time push notifications!
              </div>

              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl mx-auto mb-4 border border-slate-700">
                  <img src="/icon-512.png" alt="Studivo App" className="w-full h-full object-contain" />
                </div>
                <h4 className="font-bold text-white text-base">Studivo by Mantechion</h4>
                <p className="text-xs text-slate-400 mt-1">Version 1.0.0 • Progressive Web App</p>

                <div className="mt-6 max-w-sm mx-auto">
                  <button
                    onClick={onPwaInstall}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 text-sm"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Install App on this Device</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    On Chrome for Android, click "Install" or select "Add to Home screen" in browser menu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                You can use Google's official <strong className="text-white">Bubblewrap CLI</strong> to wrap your web manifest into a verified Google Play Store ready APK or AAB:
              </p>

              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  {bubblewrapCommand}
                </pre>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>• Creates an official Trusted Web Activity (TWA).</p>
                <p>• Runs chrome engine inside native Android wrapper.</p>
                <p>• Automatically signs your APK with your keystore.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
