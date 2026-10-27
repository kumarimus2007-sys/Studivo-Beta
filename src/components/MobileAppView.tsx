import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  ExternalLink,
  Smartphone,
  Maximize2,
  Minimize2,
  Bell,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface MobileAppViewProps {
  targetUrl: string;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  targetUrl,
  onOpenNotifications,
  unreadCount = 0,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeError(false);
    if (iframeRef.current) {
      iframeRef.current.src = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
  };

  const openInNewTab = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`flex flex-col items-center justify-center transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-40 bg-slate-950 p-0'
          : 'w-full max-w-md mx-auto py-2'
      }`}
    >
      {/* Phone Shell / Device Frame */}
      <div
        className={`w-full bg-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-slate-700/60 ${
          isFullscreen
            ? 'h-screen w-screen rounded-none'
            : 'rounded-[40px] ring-8 ring-slate-800/80 aspect-[9/19] max-h-[820px]'
        }`}
      >
        {/* Android Status Bar */}
        <div className="bg-slate-950 text-slate-300 px-6 py-2.5 flex items-center justify-between text-xs select-none border-b border-slate-800/40">
          <span className="font-semibold tracking-tight">{currentTime || '12:00'}</span>

          {/* Camera Notch / Island */}
          <div className="w-16 h-3 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.79-1.79C9.07 19.64 10.5 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
            </svg>
            <span className="font-mono text-[10px]">5G</span>
            <div className="w-4 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-500 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* App Title Header Bar */}
        <div className="bg-blue-700 text-white px-4 py-2.5 flex items-center justify-between shadow-md select-none">
          <div className="flex items-center gap-2.5">
            <img
              src="/icon-512.png"
              alt="Studivo"
              className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm object-contain"
            />
            <div>
              <h2 className="font-semibold text-sm leading-tight">Studivo</h2>
              <p className="text-[10px] text-blue-200 leading-none">mantechion.alc.onl</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              title="Push Notifications"
              className="relative p-1.5 rounded-full hover:bg-blue-600/80 transition active:scale-95"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              title="Reload Dashboard"
              className="p-1.5 rounded-full hover:bg-blue-600/80 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-full hover:bg-blue-600/80 transition active:scale-95"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* WebView Container */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          {!iframeLoaded && !iframeError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-6 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-200">Connecting to Studivo Dashboard...</p>
              <p className="text-xs text-slate-400 mt-1 font-mono break-all">{targetUrl}</p>
            </div>
          )}

          {/* Iframe Loading the User's Website */}
          <iframe
            ref={iframeRef}
            src={targetUrl}
            title="Studivo Dashboard Webview"
            className="w-full h-full border-0 bg-white"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            onLoad={() => {
              setIframeLoaded(true);
            }}
            onError={() => {
              setIframeError(true);
            }}
          />

          {/* Iframe Cross-Origin Banner Helper (if PHP server disallows frame embedding via headers) */}
          <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[180px] md:max-w-xs text-slate-400">
                SSL Secured Webview
              </span>
            </div>

            <button
              onClick={openInNewTab}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-950/60 border border-blue-800/50 px-2 py-1 rounded transition"
            >
              <span>Direct Link</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Android Bottom Navigation Bar */}
        <div className="bg-slate-950 px-8 py-3 flex items-center justify-around border-t border-slate-800/80 select-none">
          <button
            onClick={() => {
              if (iframeRef.current?.contentWindow) {
                try {
                  iframeRef.current.contentWindow.history.back();
                } catch (e) {
                  handleRefresh();
                }
              }
            }}
            title="Back"
            className="text-slate-400 hover:text-white transition p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleRefresh}
            title="Home"
            className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 hover:border-white transition"
          />

          <button
            onClick={openInNewTab}
            title="Open in Browser"
            className="w-3.5 h-3.5 rounded-xs border-2 border-slate-400 hover:border-white transition"
          />
        </div>
      </div>
    </div>
  );
};
