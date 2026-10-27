export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  url?: string;
  status: 'sent' | 'received' | 'clicked';
  icon?: string;
}

export interface AppSettings {
  targetUrl: string;
  appName: string;
  appShortName: string;
  enableVibration: boolean;
  enableSound: boolean;
  themeColor: string;
  showDevToolbar: boolean;
  autoLaunchSplash: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys?: {
    p256dh: string;
    auth: string;
  };
}
