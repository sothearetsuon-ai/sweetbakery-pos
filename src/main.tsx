import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BakeryProvider } from './context/BakeryContext';
import { MusicProvider } from './context/MusicContext';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', document.baseURI).toString();
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.warn('Offline cache registration failed:', error);
    });
  });
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught app error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50 p-6 text-center font-sans">
          <div className="max-w-md bg-white p-6 rounded-3xl shadow-xl border border-rose-200 space-y-4">
            <div className="text-4xl">🎂</div>
            <h2 className="text-lg font-black text-rose-900">SweetBakery POS</h2>
            <p className="text-xs text-slate-600">
              មានបញ្ហាបច្ចេកទេសតូចមួយក្នុងការផ្ទុកទិន្នន័យ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បី Refresh៖
            </p>
            <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-mono text-left overflow-auto max-h-24">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                🔄 ដំណើរការឡើងវិញ (Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BakeryProvider>
        <MusicProvider>
          <App />
        </MusicProvider>
      </BakeryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
