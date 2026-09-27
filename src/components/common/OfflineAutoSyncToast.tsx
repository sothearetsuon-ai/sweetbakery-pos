import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { offlineSyncService, SyncState } from '../../services/offlineSyncService';
import { soundFx } from '../../utils/audio';

export const OfflineAutoSyncToast: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const unsub = offlineSyncService.subscribe((state) => {
      setSyncState(state.status);
      setPendingCount(state.pendingCount);
      setLastSyncTime(state.lastSyncTime);
    });

    const handleSyncSuccess = (e: any) => {
      const count = e.detail?.syncedCount || 1;
      setToastType('success');
      setToastMessage(`បានធ្វើសមកាលកម្ម (Auto Sync) ${count} ទិន្នន័យទៅ Cloud ជោគជ័យ!`);
      setShowToast(true);
      try {
        soundFx.playSuccess();
      } catch (err) {}
      setTimeout(() => setShowToast(false), 4500);
    };

    const handleOnline = () => {
      setToastType('info');
      setToastMessage('អ៊ីនធឺណិតភ្ជាប់ឡើងវិញហើយ! កំពុង Auto Sync ទៅ Cloud...');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    };

    const handleOffline = () => {
      setToastType('warning');
      setToastMessage('កំពុង Offline៖ រាល់ការលក់ & កុម្ម៉ង់នឹងរក្សាទុកលើឧបករណ៍ និង Sync ដោយស្វ័យប្រវត្តពេល Online វិញ');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    window.addEventListener('bakery_auto_sync_success', handleSyncSuccess);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('bakery_auto_sync_success', handleSyncSuccess);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[110] animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 text-xs font-bold max-w-sm ${
          toastType === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/30'
            : toastType === 'warning'
            ? 'bg-amber-950/90 border-amber-500/80 text-amber-200 shadow-amber-950/30'
            : 'bg-slate-900/90 border-pink-500/80 text-pink-200 shadow-slate-950/30'
        }`}
      >
        {toastType === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
        ) : toastType === 'warning' ? (
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <RefreshCw className="w-4 h-4 text-pink-400 shrink-0 animate-spin" />
        )}
        <span className="leading-snug">{toastMessage}</span>
      </div>
    </div>
  );
};
