import React, { useEffect, useRef, useState } from 'react';

const DESKTOP_FRAME_COUNT = 240;
// Frame 0, zodat de pagina bij het laden (scroll = 0) het begin van de
// animatie toont — frameIndex = startFrame op scroll-positie 0 (zie animate()).
const DESKTOP_START_FRAME = 0;
const DESKTOP_BASE_URL =
  'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/front%20screen%201';

// Exacte delay-waarde per frame (0.016s of 0.017s) voor de "front screen 1"
// bucket (nieuwe upload, andere content dan de vorige "front screen" bucket),
// opgehaald door elk frame_000 t/m frame_299 los te testen (HEAD-requests) tot
// frame_240 een 404 gaf — er zijn dus 240 frames (000 t/m 239). Het patroon is
// onregelmatig en niet te voorspellen. Gedeeld tussen desktop én mobiel, want
// beide gebruiken dezelfde frame-set.
const FRAME_DELAYS: string[] = [
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017',
  '0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016',
  '0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017',
  '0.017','0.016','0.017','0.017','0.016','0.017','0.017','0.016','0.017','0.016',
];

// Zelfde bron-set als desktop ("front screen" bucket, 240 frames), dus
// afgeleid van de desktop-constanten om drift tussen beide te voorkomen.
const MOBILE_FRAME_COUNT = DESKTOP_FRAME_COUNT;
const MOBILE_START_FRAME = 0;
const MOBILE_BASE_URL = DESKTOP_BASE_URL;

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

function easeScrollProgress(p: number) {
  let eased = 1 - Math.pow(1 - p, 4);
  const slowStart = 0.75;
  if (eased > slowStart) {
    const tail = (eased - slowStart) / (1 - slowStart);
    const slowedTail = Math.pow(tail, 2);
    eased = slowStart + slowedTail * (1 - slowStart);
  }
  return eased;
}

// Gedeelde URL-opbouw: desktop en mobiel gebruiken dezelfde "front screen"
// frame-set (zelfde bestandsnaampatroon en delay-mapping), enkel de base-URL
// kan in theorie uiteenlopen — vandaar de aparte functies die 'm doorgeven.
function getFrontScreenFrameSrc(baseUrl: string, index: number) {
  const padded = index.toString().padStart(3, '0');
  const delay = FRAME_DELAYS[index];
  return `${baseUrl}/frame_${padded}_delay-${delay}s.png`;
}

function getDesktopFrameSrc(index: number) {
  return getFrontScreenFrameSrc(DESKTOP_BASE_URL, index);
}

function getMobileFrameSrc(index: number) {
  return getFrontScreenFrameSrc(MOBILE_BASE_URL, index);
}

function getFrameSrc(index: number) {
  if (isMobileViewport()) {
    return getMobileFrameSrc(index);
  }
  return getDesktopFrameSrc(index);
}

// Leest de kleur van een pixel een paar px vanaf de linkerbovenhoek van de
// afbeelding (om randartefacten te vermijden) via een tijdelijke 1x1 canvas.
// Geeft null terug als het canvas "tainted" raakt door CORS-beperkingen.
function sampleImageCornerColor(img: HTMLImageElement): string | null {
  try {
    const probeCanvas = document.createElement('canvas');
    probeCanvas.width = 1;
    probeCanvas.height = 1;
    const probeCtx = probeCanvas.getContext('2d');
    if (!probeCtx) return null;
    const sampleX = Math.min(5, Math.max(0, img.naturalWidth - 1));
    const sampleY = Math.min(5, Math.max(0, img.naturalHeight - 1));
    probeCtx.drawImage(img, sampleX, sampleY, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = probeCtx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return null;
  }
}

interface HeroScrollAnimationProps {
  children?: React.ReactNode;
}

const HeroScrollAnimation: React.FC<HeroScrollAnimationProps> = ({ children }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [isReady, setIsReady] = useState(false);
  const lastFrameIndex = useRef<number>(-1);
  const bgColor = useRef<string | null>(null);
  const bgColorDetermined = useRef(false);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const mobile = isMobileViewport();
    const frameCount = mobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const startFrame = mobile ? MOBILE_START_FRAME : DESKTOP_START_FRAME;

    // Allocate array upfront so indices are stable
    const images: HTMLImageElement[] = new Array(frameCount);
    imagesRef.current = images;

    // Load start frame first — canvas only becomes visible once this is ready
    const startImg = new Image();
    startImg.referrerPolicy = 'no-referrer';
    startImg.crossOrigin = 'anonymous'; // nodig om later pixels te mogen uitlezen (getImageData)
    startImg.src = getFrameSrc(startFrame);
    startImg.onload = () => {
      images[startFrame] = startImg;
      setIsReady(true);
    };
    startImg.onerror = () => {
      // Fallback: show canvas anyway so the page isn't stuck
      setIsReady(true);
    };
    images[startFrame] = startImg;

    // Load all other frames in background
    for (let i = 0; i < frameCount; i++) {
      if (i === startFrame) continue;
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.crossOrigin = 'anonymous';
      img.src = getFrameSrc(i);
      images[i] = img;
    }
  }, []);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    
    let img: HTMLImageElement | null = imagesRef.current[index];
    
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = null;
      const mobile = isMobileViewport();
      const frameCount = mobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;

      for (let offset = 1; offset < frameCount; offset++) {
        const prev = index - offset;
        const next = index + offset;
        
        if (prev >= 0) {
          const pImg = imagesRef.current[prev];
          if (pImg && pImg.complete && pImg.naturalWidth > 0) { img = pImg; break; }
        }
        if (next < frameCount) {
          const nImg = imagesRef.current[next];
          if (nImg && nImg.complete && nImg.naturalWidth > 0) { img = nImg; break; }
        }
      }
    }

    if (img && canvas && context) {
      // Achtergrondkleur eenmalig bepalen op basis van het eerste geladen frame
      // (pixel-sample vanuit een hoek van de afbeelding) en daarna cachen.
      if (!bgColorDetermined.current) {
        bgColor.current = sampleImageCornerColor(img);
        bgColorDetermined.current = true;
        if (!bgColor.current) {
          // Canvas tainted door CORS — val terug op wit.
          bgColor.current = '#ffffff';
        }
      }
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const isMobile = window.innerWidth < 768;
      const baseRatio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      // Pure cover-gedrag toont de pc te groot/uitgezoomd. Desktop: iets
      // kleiner dan voorheen (0.6 -> 0.54) voor een rustiger, minder dominant
      // beeld. Mobiel blijft exact 0.56 (ongewijzigd, zoals gevraagd).
      const scaleAdjustment = isMobile ? 0.56 : 0.54;
      const ratio = baseRatio * scaleAdjustment;
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const x = (canvasWidth - newWidth) / 2;
      const dpr = window.devicePixelRatio || 1;
      // Offsets proportioneel meeschalen zodat de positionering relatief
      // t.o.v. het kleinere beeld gelijk blijft aan voorheen. Mobiel:
      // verticalOffset/horizontalOffset ongewijzigd (94 / -4). Desktop:
      // verticalOffset-basis verhoogd (40 -> 60) zodat de pc iets verder
      // naar beneden staat, in lijn met de iets kleinere schaal.
      const verticalOffset = (isMobile ? 94 * dpr : 60 * dpr) * scaleAdjustment;
      const horizontalOffset = (isMobile ? -4 * dpr : 16 * dpr) * scaleAdjustment;
      const y = (canvasHeight - newHeight) / 2 + verticalOffset;

      context.fillStyle = bgColor.current ?? '#ffffff';
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, x + horizontalOffset, y, newWidth, newHeight);
      lastFrameIndex.current = index;
    }
  };

  const animate = () => {
    // Lager dan voorheen (was 0.12) voor een vloeiendere, meer cinematic
    // "glide" i.p.v. dat de animatie direct 1-op-1 met de scroll meeschiet.
    const lerpFactor = 0.08;
    const diff = targetProgress.current - currentProgress.current;
    currentProgress.current += diff * lerpFactor;

    const mobile = isMobileViewport();
    const frameCount = mobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const startFrame = mobile ? MOBILE_START_FRAME : DESKTOP_START_FRAME;
    const frameIndex = Math.floor(startFrame + currentProgress.current * (frameCount - 1 - startFrame));
    
    if (frameIndex !== lastFrameIndex.current) drawFrame(frameIndex);

    if (Math.abs(diff) > 0.0001) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      animationFrameId.current = null;
    }
  };

  const handleScroll = () => {
    if (!sectionRef.current || !isReady) return;
    const rect = sectionRef.current.getBoundingClientRect();
    let rawProgress = -rect.top / (window.innerHeight * 0.8);
    rawProgress = Math.min(1, Math.max(0, rawProgress));
    targetProgress.current = easeScrollProgress(rawProgress);
    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Use the canvas's actual rendered size, not window.innerWidth,
    // because mobile browsers change innerWidth when the address bar slides in/out.
    const w = canvas.offsetWidth || window.innerWidth;
    const h = canvas.offsetHeight || window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (lastFrameIndex.current >= 0) {
      drawFrame(lastFrameIndex.current);
    } else {
      const mobile = isMobileViewport();
      drawFrame(mobile ? MOBILE_START_FRAME : DESKTOP_START_FRAME);
    }
  };

  useEffect(() => {
    if (isReady) {
      handleResize();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      handleScroll();
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isReady]);

  return (
    <section ref={sectionRef} className="relative h-[160vh] bg-slate-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/35 to-slate-950/65 md:from-slate-950/12 md:via-slate-950/28 md:to-slate-950/60 z-10" />
      </div>
      <div className="relative z-10 -mt-[100vh] min-h-screen w-full flex items-center justify-center">
        {children}
      </div>
      <div className="h-[60vh]" />
    </section>
  );
};

export default HeroScrollAnimation;
