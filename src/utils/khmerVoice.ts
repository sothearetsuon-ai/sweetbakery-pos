import { soundFx } from './audio';
import { KHMER_QR_SUCCESS_AUDIO_BASE64 } from './khmerVoiceAudio';

// Convert numbers (e.g. 25000) into Khmer phonetic words (e.g. ម្ភៃប្រាំពាន់)
export function numberToKhmerWords(num: number): string {
  if (num <= 0) return 'សូន្យ';

  const digits = ['សូន្យ', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
  const tens = ['', 'ដប់', 'ម្ភៃ', 'សាមសិប', 'សែសិប', 'ហាសិប', 'ហុកសិប', 'ចិតសិប', 'ប៉ែតសិប', 'កៅសិប'];

  if (num < 10) return digits[num];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    if (u === 0) return tens[t];
    return `${tens[t]}${digits[u]}`;
  }

  if (num < 1000) {
    const h = Math.floor(num / 100);
    const rem = num % 100;
    const hStr = `${digits[h]}រយ`;
    if (rem === 0) return hStr;
    return `${hStr} ${numberToKhmerWords(rem)}`;
  }

  if (num < 10000) {
    const th = Math.floor(num / 1000);
    const rem = num % 1000;
    const thStr = `${digits[th]}ពាន់`;
    if (rem === 0) return thStr;
    return `${thStr} ${numberToKhmerWords(rem)}`;
  }

  if (num < 100000) {
    const tenTh = Math.floor(num / 10000);
    const rem = num % 10000;
    const mStr = `${digits[tenTh]}ម៉ឺន`;
    if (rem === 0) return mStr;
    return `${mStr} ${numberToKhmerWords(rem)}`;
  }

  if (num < 1000000) {
    const hundredTh = Math.floor(num / 100000);
    const rem = num % 100000;
    const sStr = `${digits[hundredTh]}សែន`;
    if (rem === 0) return sStr;
    return `${sStr} ${numberToKhmerWords(rem)}`;
  }

  const mil = Math.floor(num / 1000000);
  const rem = num % 1000000;
  const milStr = `${digits[mil]}លាន`;
  if (rem === 0) return milStr;
  return `${milStr} ${numberToKhmerWords(rem)}`;
}

class KhmerVoiceSoundbox {
  private isSpeaking = false;
  private soundboxEnabled = true;

  constructor() {
    // Load setting from localStorage
    try {
      const saved = localStorage.getItem('bakery_soundbox_enabled');
      if (saved !== null) {
        this.soundboxEnabled = saved === 'true';
      }
    } catch (e) {
      // ignore
    }
  }

  public isEnabled(): boolean {
    return this.soundboxEnabled;
  }

  public setEnabled(val: boolean): void {
    this.soundboxEnabled = val;
    try {
      localStorage.setItem('bakery_soundbox_enabled', String(val));
    } catch (e) {
      // ignore
    }
  }

  // Play crisp dual-tone audio alert + natural spoken announcement
  public announcePayment(amount: number, currency: 'KHR' | 'USD' = 'KHR', bankName: string = 'KHQR'): void {
    if (!this.soundboxEnabled) return;

    // 1. Play immediate celebratory cash register sound
    soundFx.playSuccess();

    // 2. Mobile haptic vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 300, 100, 400]);
      } catch (e) {
        // ignore
      }
    }

    try {
      const words = currency === 'KHR'
        ? `${numberToKhmerWords(amount)} រៀល`
        : `${amount} ដុល្លារ`;

      const announcementText = `ទទួលបានប្រាក់ ${words} តាមរយៈ ${bankName} ជោគជ័យ!`;
      const encodedText = encodeURIComponent(announcementText);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=km&client=tw-ob`;

      // Helper to play guaranteed offline Khmer Voice base64 audio
      const playOfflineVoice = () => {
        try {
          const offlineAudio = new Audio(KHMER_QR_SUCCESS_AUDIO_BASE64);
          offlineAudio.volume = 1.0;
          offlineAudio.play().catch((err) => {
            console.warn('[Soundbox] Offline audio playback error:', err);
            // Last resort: Web Speech Synthesis
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(announcementText);
                utterance.lang = 'km-KH';
                utterance.rate = 0.95;
                window.speechSynthesis.speak(utterance);
              } catch (ex) {}
            }
          });
        } catch (err) {
          console.warn('[Soundbox] Offline audio init error:', err);
        }
      };

      // Priority 1: Native Android bridge with MediaPlayer
      if (typeof (window as any).SweetBakeryNative?.playAudioUrl === 'function') {
        setTimeout(() => {
          try {
            (window as any).SweetBakeryNative.playAudioUrl(audioUrl);
          } catch (e) {
            playOfflineVoice();
          }
        }, 450);
        return;
      }

      // Priority 2: Old Android bridge fallback
      if (typeof (window as any).SweetBakeryNative?.speakKhmer === 'function') {
        try {
          (window as any).SweetBakeryNative.speakKhmer(announcementText);
        } catch (e) {}
      }

      // Priority 3: Dynamic audio stream (WITHOUT crossOrigin to prevent CORS failure)
      const audio = new Audio();
      audio.src = audioUrl;

      let hasPlayed = false;
      audio.onplay = () => {
        hasPlayed = true;
        this.isSpeaking = true;
      };
      audio.onended = () => {
        this.isSpeaking = false;
      };
      audio.onerror = () => {
        if (!hasPlayed) {
          hasPlayed = true;
          playOfflineVoice();
        }
      };

      setTimeout(() => {
        audio.play().catch(() => {
          if (!hasPlayed) {
            hasPlayed = true;
            playOfflineVoice();
          }
        });
      }, 450);
    } catch (err) {
      console.warn('[Soundbox] Announcement error:', err);
    }
  }
}

export const khmerVoiceSoundbox = new KhmerVoiceSoundbox();
