import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { supabase, getUserIdentifier } from '../lib/supabase';

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission === 'default') {
      const dismissed = localStorage.getItem('notification-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }

    if (currentPermission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers not supported');
      }

      await navigator.serviceWorker.register('/sw.js');

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToPush();
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionJSON = subscription.toJSON();
      const userIdentifier = getUserIdentifier();

      await supabase.from('push_subscriptions').insert({
        user_identifier: userIdentifier,
        endpoint: subscription.endpoint,
        p256dh_key: subscriptionJSON.keys?.p256dh || '',
        auth_key: subscriptionJSON.keys?.auth || '',
        is_active: true,
        notification_time: '09:00:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-dismissed', new Date().toISOString());
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-down">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-2xl p-4 border border-white/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Daily Reminders</h3>
              <p className="text-purple-100 text-xs">Never miss your daily quote</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white text-sm mb-4">
          Get a notification every day with your personalized quote. Stay inspired!
        </p>

        <div className="flex gap-2">
          <button
            onClick={requestNotificationPermission}
            className="flex-1 bg-white hover:bg-gray-100 text-purple-600 font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Enable Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
