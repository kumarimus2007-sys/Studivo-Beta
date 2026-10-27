import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenApkModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenApkModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed as PWA or dismissed, hide banner
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white px-4 py-2.5 shadow-lg border-b border-blue-600/40 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
            <img src="/icon-512.png" alt="Studivo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-semibold text-white">Install Studivo Mobile App:</span>{' '}
            <span className="text-blue-200 hidden sm:inline">
              Get real-time push notifications, offline access, and fast dashboard launch!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chromium / Android install button */}
          {isInstallable ? (
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-50 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition border border-white/30"
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Install on iOS</span>
            </button>
          ) : (
            <button
              onClick={onOpenApkModal}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-900 shadow-sm hover:bg-blue-50 transition active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get APK / App</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-blue-200 hover:text-white rounded transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon-512.png" alt="Studivo" className="w-10 h-10 rounded-xl bg-white p-1" />
              <div>
                <h3 className="text-base font-bold text-white">Install Studivo on iPhone</h3>
                <p className="text-xs text-slate-400">Add to your home screen</p>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 my-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share button</strong> (box with arrow) at bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in top right corner.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
