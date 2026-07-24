import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ReactLenis} from 'lenis/react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Eén globale Lenis-instantie voor de hele site (root: geen extra
        wrapper-divs, stuurt direct window/document aan) — zorgt voor
        consistent soepel scrollen op zowel trackpad als muiswiel, overal,
        niet alleen binnen de hero-sectie. duration iets korter dan Lenis'
        eigen (ongeveer 1.2s-achtige) gevoel voor een net iets sneller
        resultaat; easing blijft Lenis' eigen standaard ease-out. */}
    <ReactLenis root options={{ duration: 1.0 }}>
      <App />
    </ReactLenis>
  </StrictMode>,
);

