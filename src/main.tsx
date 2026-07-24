import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ReactLenis} from 'lenis/react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Eén globale Lenis-instantie voor de hele site (root: geen extra
        wrapper-divs, stuurt direct window/document aan). duration iets
        korter dan Lenis' eigen (ongeveer 1.2s-achtige) gevoel voor een net
        iets sneller resultaat; easing blijft Lenis' eigen standaard
        ease-out.

        smoothWheel: true — muiswiel-scroll blijft gesmooth (het hele punt
        van Lenis). syncTouch: false — dit is in Lenis 1.3.x de vervanger
        van de oudere `smoothTouch`-optie; op `false` laat Lenis échte
        touch-drag (mobiel/tablet) native/direct verlopen i.p.v. gesmooth.
        Let op: een laptop-trackpad genereert in de browser 'wheel'-events,
        geen 'touch'-events — syncTouch raakt dus alleen echte
        touchscreens, niet trackpad-scrollen. Trackpad blijft daardoor via
        hetzelfde smoothWheel-pad lopen als een fysiek muiswiel; Lenis (en
        de browser) kan die twee niet uit elkaar houden op basis van het
        wheel-event alleen. */}
    <ReactLenis root options={{ duration: 1.0, smoothWheel: true, syncTouch: false }}>
      <App />
    </ReactLenis>
  </StrictMode>,
);

