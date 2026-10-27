import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Terminal,
  FolderArchive,
  Sparkles,
  ExternalLink,
  Loader2,
  X,
  ShieldAlert,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAndroidStudioProjectZip, generateDirectApkPackage } from '../utils/androidProjectZip';

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
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'install' | 'online' | 'studio'>('apk');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Direct APK file download
  const handleDownloadDirectApk = async () => {
    try {
      setDownloadingApk(true);
      const apkBlob = await generateDirectApkPackage(targetUrl);
      const url = URL.createObjectURL(apkBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Studivo-App-v1.0.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess('Studivo-App-v1.0.apk डाउनलोड हो गया है!');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (e) {
      console.error('Failed to generate APK', e);
      alert('APK generation failed');
    } finally {
      setDownloadingApk(false);
    }
  };

  // Android Studio Project Zip download
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

      setDownloadSuccess('Android Studio Project (.ZIP) डाउनलोड हो गया है!');
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (e) {
      console.error('Failed to generate project zip', e);
      alert('Error generating Android project zip');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img src="/icon-512.png" alt="Studivo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Studivo APK Download & Install Center</span>
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  v1.0.0
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                यहाँ से अपनी Studivo Android APK डाउनलोड करें या फ़ोन में इनस्टॉल करें
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

        {/* Credentials Safety Alert */}
        <div className="bg-amber-950/50 border-b border-amber-900/40 px-5 py-2.5 flex items-center gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>सुरक्षा सूचना:</strong> अपने GitHub या ईमेल के पासवर्ड किसी को देने की ज़रूरत नहीं है! नीचे दिए गए बटनों से सब कुछ सीधे होगा।
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-3 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>1. Download APK (.apk फ़ाइल)</span>
          </button>

          <button
            onClick={() => setActiveTab('install')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'install'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2. Direct Phone Install</span>
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'online'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>3. 1-Click Online APK Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`py-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'studio'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>4. Android Studio Project (.ZIP)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/60 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200 leading-relaxed">
                  <strong className="text-white text-sm block mb-1">Studivo-App-v1.0.apk तैयार है!</strong>
                  यह APK पैकेज आपकी वेबसाइट (<code className="text-blue-300">dashboard.php</code>) को आपके ओरिजिनल Logo और Splash Screen के साथ खोलता है और पुश नोटिफिकेशन सपोर्ट करता है।
                </div>
              </div>

              {/* Direct APK Download Button */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg mx-auto flex items-center justify-center">
                  <img src="/icon-512.png" alt="Studivo APK" className="w-full h-full object-contain" />
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">Studivo-App-v1.0.apk</h4>
                  <p className="text-xs text-slate-400">Android Package • com.mantechion.studivo</p>
                </div>

                <button
                  onClick={handleDownloadDirectApk}
                  disabled={downloadingApk}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition active:scale-95 text-sm"
                >
                  {downloadingApk ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Studivo APK...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-emerald-300" />
                      <span>Download Studivo APK (.apk फ़ाइल डाउनलोड करें)</span>
                    </>
                  )}
                </button>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center justify-center gap-2 animate-fade-in font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{downloadSuccess}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="font-semibold text-slate-200 mb-1">📱 फोन पर कैसे इनस्टॉल करें:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>ऊपर दिए गए बटन पर क्लिक करके <strong className="text-slate-200">Studivo-App-v1.0.apk</strong> डाउनलोड करें।</li>
                  <li>अपने फ़ोन के Downloads फोल्डर में जाकर उस फाइल पर टैप करें।</li>
                  <li>"Install" पर क्लिक करें। (यदि पूछा जाए तो "Install from Unknown Sources" चालू करें)।</li>
                  <li>ऐप आपके मोबाइल पर खुल जाएगी!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-xl mx-auto mb-3 border border-slate-700">
                <img src="/icon-512.png" alt="Studivo App" className="w-full h-full object-contain" />
              </div>

              <h4 className="font-bold text-white text-lg">Direct Phone Install (WebAPK)</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                बिना किसी APK डाउनलोड के, यह ऐप सीधे आपके Android फ़ोन की होम स्क्रीन पर एक ओरिजिनल ऐप की तरह इंस्टॉल हो जाएगी।
              </p>

              <div className="max-w-sm mx-auto pt-2">
                <button
                  onClick={onPwaInstall}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition active:scale-95 text-sm"
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Install App On This Device (अभी फ़ोन में इनस्टॉल करें)</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-white">Chrome ब्राउज़र से इंस्टॉल करने का आसान तरीका:</p>
                <p>1. अपने Android फ़ोन के Chrome में यह ऐप खोलें।</p>
                <p>2. ऊपर दिए गए <strong>"Install App"</strong> बटन पर क्लिक करें।</p>
                <p>3. अगर बटन न दिखे, तो Chrome के दाईं तरफ ऊपर <strong>तीन बिंदु (⋮)</strong> दबाएं और <strong>"Add to Home Screen" (या "Install app")</strong> पर क्लिक करें।</p>
              </div>
            </div>
          )}

          {activeTab === 'online' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-xs text-indigo-200">
                <strong className="text-white block mb-1">🌐 Microsoft PWABuilder (फ्री ऑनलाइन APK जनरेटर):</strong>
                माइक्रोसॉफ्ट का आधिकारिक टूल किसी भी वेबसाइट या PWA को बिना कोडिंग के 30 सेकंड में हस्ताक्षरित (Signed) Android APK में बदल देता है!
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-xs text-slate-300">
                  आपकी वेबसाइट का लिंक: <code className="text-blue-400 font-mono">https://mantechion.alc.onl/studivo/app/dashboard.php</code>
                </p>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition active:scale-95"
                >
                  <span>Open PWABuilder (1-Click APK Builder)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1 pt-2">
                  <li>PWABuilder खोलें और अपनी वेबसाइट का URL डालें।</li>
                  <li><strong>"Start"</strong> पर क्लिक करें।</li>
                  <li><strong>"Package for Android"</strong> पर क्लिक करके सीधे अपना APK डाउनलोड कर लें!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-3">
                <div className="font-semibold text-white flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-blue-400" />
                  <span>Complete Android Studio Project Source Code (.ZIP)</span>
                </div>
                <p className="text-slate-400">
                  इसमें पूरा जावा सोर्स कोड शामिल है: <code className="text-blue-300">MainActivity.java</code>, <code className="text-blue-300">MyFirebaseMessagingService.java</code> (पुश नोटिफिकेशन), <code className="text-blue-300">SplashActivity.java</code> (लोगो स्प्लैश स्क्रीन), और Gradle 9.3.1 / AGP 9.1.1।
                </p>

                <button
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition active:scale-95"
                >
                  {downloadingZip ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Project ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Download Android Studio Project (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
