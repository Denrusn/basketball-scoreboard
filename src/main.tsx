import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMobileImmersiveMode } from './utils/capacitorUtils.ts';

// Automatically activate full screen / hide status bar on mobile app launch
initMobileImmersiveMode().catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

