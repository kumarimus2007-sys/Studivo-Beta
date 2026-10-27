import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
  interactive?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2400,
  interactive = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration - 300) {
        setFading(true);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        if (onFinish) onFinish();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-white text-slate-900 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Spacer */}
      <div className="h-16" />

      {/* Main Branding Center */}
      <div className="flex flex-col items-center px-6 text-center animate-fade-in">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-blue-100/60 blur-xl animate-pulse" />
          <img
            src="/icon-512.png"
            alt="Studivo Logo"
            className="relative w-36 h-36 md:w-44 md:h-44 object-contain drop-shadow-md transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Title Matching Attachment */}
        <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-slate-950">
          Studivo By
        </h1>
        <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-slate-950 -mt-1">
          Mantechion
        </h2>

        <p className="mt-3 text-xs md:text-sm font-medium tracking-wide text-blue-700 uppercase">
          Learning & Dashboard App
        </p>
      </div>

      {/* Bottom Progress Bar & Version */}
      <div className="w-full max-w-xs px-8 pb-12 flex flex-col items-center">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center w-full mt-3 text-xs text-slate-400 font-mono">
          <span>Loading portal...</span>
          <span>{progress}%</span>
        </div>

        {interactive && (
          <button
            onClick={onFinish}
            className="mt-4 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition"
          >
            Skip Splash
          </button>
        )}
      </div>
    </div>
  );
};
