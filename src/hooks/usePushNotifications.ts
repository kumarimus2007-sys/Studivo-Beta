import { useEffect, useState, useCallback } from 'react';
import { NotificationItem } from '../types';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [notificationsHistory, setNotificationsHistory] = useState<NotificationItem[]>([]);
  const [deviceToken, setDeviceToken] = useState<string>('');

  // Initialize service worker & permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Load saved notification history
    try {
      const savedHistory = localStorage.getItem('studivo_notifications');
      if (savedHistory) {
        setNotificationsHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn('Failed to load notification history', e);
    }

    // Register / detect service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setSwRegistration(reg);
          // Check for existing push subscription
          return reg.pushManager.getSubscription();
        })
        .then((sub) => {
          if (sub) {
            setSubscription(sub);
            setDeviceToken(JSON.stringify(sub));
          } else {
            // Generate a persistent device token identifier for testing with PHP backend
            let storedToken = localStorage.getItem('studivo_device_token');
            if (!storedToken) {
              storedToken = 'fcm_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
              localStorage.setItem('studivo_device_token', storedToken);
            }
            setDeviceToken(storedToken);
          }
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  // Request Notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Notification API is not supported on this device/browser');
      return 'denied';
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted' && swRegistration) {
        // Try to subscribe to Push Manager if VAPID is available, or use registration
        try {
          const sub = await swRegistration.pushManager.getSubscription();
          if (sub) {
            setSubscription(sub);
            setDeviceToken(JSON.stringify(sub));
          }
        } catch (e) {
          console.log('Push subscription check:', e);
        }
      }
      return res;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [swRegistration]);

  // Send a push notification (works via SW showNotification or fallback Notification)
  const sendPushNotification = useCallback(
    async ({
      title,
      body,
      url = 'https://mantechion.alc.onl/studivo/app/dashboard.php',
      delaySeconds = 0,
    }: {
      title: string;
      body: string;
      url?: string;
      delaySeconds?: number;
    }) => {
      if (permission !== 'granted') {
        const result = await requestPermission();
        if (result !== 'granted') {
          return false;
        }
      }

      const trigger = async () => {
        const notificationData: NotificationItem = {
          id: Date.now().toString(),
          title,
          message: body,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          url,
          status: 'sent',
          icon: '/icon-512.png',
        };

        // Try via Service Worker showNotification (Android heads-up banner)
        if (swRegistration && 'showNotification' in swRegistration) {
          try {
            await swRegistration.showNotification(title, {
              body,
              icon: '/icon-512.png',
              badge: '/icon-512.png',
              data: { url },
              tag: 'studivo-alert-' + Date.now(),
              requireInteraction: true,
              ...(('vibrate' in Notification.prototype) ? { vibrate: [200, 100, 200, 100, 200] } : {}),
            } as NotificationOptions);
          } catch (e) {
            console.warn('SW showNotification failed, using fallback Notification', e);
            new Notification(title, {
              body,
              icon: '/icon-512.png',
            });
          }
        } else {
          // Standard browser Notification constructor fallback
          new Notification(title, {
            body,
            icon: '/icon-512.png',
          });
        }

        // Play subtle sound if supported
        try {
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
          // audio context not allowed without prior user interaction
        }

        // Add to history
        setNotificationsHistory((prev) => {
          const updated = [notificationData, ...prev.slice(0, 29)];
          try {
            localStorage.setItem('studivo_notifications', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      };

      if (delaySeconds > 0) {
        setTimeout(trigger, delaySeconds * 1000);
      } else {
        await trigger();
      }

      return true;
    },
    [permission, requestPermission, swRegistration]
  );

  const clearHistory = useCallback(() => {
    setNotificationsHistory([]);
    try {
      localStorage.removeItem('studivo_notifications');
    } catch (e) {}
  }, []);

  return {
    permission,
    isSupported,
    deviceToken,
    subscription,
    notificationsHistory,
    requestPermission,
    sendPushNotification,
    clearHistory,
  };
}
