import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BakeryProvider } from './context/BakeryContext';
import { MusicProvider } from './context/MusicContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BakeryProvider>
      <MusicProvider>
        <App />
      </MusicProvider>
    </BakeryProvider>
  </React.StrictMode>
);
