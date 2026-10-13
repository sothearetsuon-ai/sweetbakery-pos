// Real-time Payment Listener & Verification Service for SweetBakery POS
// Listens to incoming bank transfers (ABA / Bakong KHQR) via Firebase Cloud & local events

import { getFirestoreDb } from './firebase';
import { collection, onSnapshot, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { khmerVoiceSoundbox } from '../utils/khmerVoice';

export interface PaymentNotification {
  id: string;
  amount: number;
  currency: 'KHR' | 'USD';
  bankName: string; // 'ABA', 'Bakong', 'ACLEDA', etc.
  senderName?: string;
  transactionId?: string;
  timestamp: number;
  orderNumber?: string;
  isSimulated?: boolean;
}

type PaymentListenerCallback = (payment: PaymentNotification) => void;

class PaymentListenerService {
  private listeners: Set<PaymentListenerCallback> = new Set();
  private unsubscribeFirestore: (() => void) | null = null;
  private recentPaymentIds: Set<string> = new Set();
  private isListening = false;

  constructor() {
    this.startListening();
  }

  // Subscribe a component to incoming payments
  public subscribe(callback: PaymentListenerCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all subscribed components and announce payment voice
  public notify(payment: PaymentNotification, shouldSpeak = true): void {
    if (this.recentPaymentIds.has(payment.id)) return;
    this.recentPaymentIds.add(payment.id);

    // Keep set bounded
    if (this.recentPaymentIds.size > 200) {
      const first = Array.from(this.recentPaymentIds)[0];
      this.recentPaymentIds.delete(first);
    }

    // 1. Play Khmer Voice Soundbox announcement
    if (shouldSpeak) {
      khmerVoiceSoundbox.announcePayment(payment.amount, payment.currency, payment.bankName);
    }

    // 2. Dispatch to all active callbacks (e.g. CheckoutModal, Floating toasts)
    this.listeners.forEach((cb) => {
      try {
        cb(payment);
      } catch (e) {
        console.error('[PaymentListener] Error in callback:', e);
      }
    });

    // 3. Dispatch standard browser CustomEvent for broad app awareness
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('khqr_payment_received', { detail: payment }));
    }
  }

  // Start listening to Firebase Firestore in real-time
  public startListening(): void {
    if (this.isListening) return;
    this.isListening = true;

    try {
      const db = getFirestoreDb();
      if (!db) {
        console.log('[PaymentListener] Running in Local Mode (waiting for Firebase sync)');
        return;
      }

      // Listen for payment notifications created in the last 15 minutes
      const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
      const collRef = collection(db, 'payment_notifications');
      const q = query(
        collRef,
        where('timestamp', '>=', fifteenMinutesAgo),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      this.unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const payment: PaymentNotification = {
                id: change.doc.id,
                amount: Number(data.amount) || 0,
                currency: data.currency === 'USD' ? 'USD' : 'KHR',
                bankName: data.bankName || 'KHQR Bakong',
                senderName: data.senderName,
                transactionId: data.transactionId,
                timestamp: data.timestamp || Date.now(),
                orderNumber: data.orderNumber,
                isSimulated: Boolean(data.isSimulated),
              };

              // Only notify if recent (within 2 minutes of real clock)
              if (Date.now() - payment.timestamp < 120000) {
                this.notify(payment, true);
              }
            }
          });
        },
        (error) => {
          console.warn('[PaymentListener] Firestore listener warning:', error.message);
        }
      );
    } catch (e) {
      console.warn('[PaymentListener] Initialization notice:', e);
    }
  }

  // Simulate payment for staff/owner testing
  public simulatePayment(amount: number = 25000, currency: 'KHR' | 'USD' = 'KHR', bankName: string = 'ABA Bank'): PaymentNotification {
    const payment: PaymentNotification = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount,
      currency,
      bankName,
      senderName: 'អតិថិជនសាកល្បង (Test Customer)',
      transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: Date.now(),
      isSimulated: true,
    };

    // Broadcast immediately to app & play voice
    this.notify(payment, true);
    return payment;
  }

  // Post payment to cloud (used by Webhooks, Bots, or Owner's phone)
  public async pushPaymentToCloud(amount: number, currency: 'KHR' | 'USD' = 'KHR', bankName: string = 'ABA Bank', senderName?: string): Promise<boolean> {
    try {
      const db = getFirestoreDb();
      if (!db) {
        // Fallback local broadcast
        this.simulatePayment(amount, currency, bankName);
        return true;
      }

      await addDoc(collection(db, 'payment_notifications'), {
        amount,
        currency,
        bankName,
        senderName: senderName || 'KHQR Payment',
        timestamp: Date.now(),
        serverCreatedAt: serverTimestamp(),
      });
      return true;
    } catch (e) {
      console.error('[PaymentListener] Error pushing to cloud:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    this.isListening = false;
  }
}

export const paymentListener = new PaymentListenerService();
