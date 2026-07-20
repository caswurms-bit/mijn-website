import React, { useEffect, useRef, useState } from 'react';

const DESKTOP_FRAME_COUNT = 240;
// Proportioneel geschaald vanaf de oude waarde (45 van de 104 frames, ~43%).
const DESKTOP_START_FRAME = 104;
const DESKTOP_BASE_URL =
  'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/front%20screen%201';

// Exacte delay-waarde per frame (0.016s of 0.017s), opgehaald via de Supabase
// Storage API — het patroon is onregelmatig en niet te voorspellen.
const DESKTOP_FRAME_DELAYS: string[] = [
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

const MOBILE_FRAME_COUNT = 70;
const MOBILE_START_FRAME = 0;
const MOBILE_BASE_URL =
  'https://lnzbfjukwcfzojuiqxgm.supabase.co/storage/v1/object/public/video%20voor%20telefoon';

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

function getDesktopFrameSrc(index: number) {
  const padded = index.toString().padStart(3, '0');
  const delay = DESKTOP_FRAME_DELAYS[index];
  return `${DESKTOP_BASE_URL}/frame_${padded}_delay-${delay}s.png`;
}

function getMobileFrameSrc(index: number) {
  const padded = index.toString().padStart(2, '0');
  const delay = index === 2 ? '0.034s' : '0.033s';
  return `${MOBILE_BASE_URL}/frame_${padded}_delay-${delay}.webp`;
}

function getFrameSrc(index: number) {
  if (isMobileViewport()) {
    return getMobileFrameSrc(index);
  }
  return getDesktopFrameSrc(index);
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
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const isMobile = window.innerWidth < 768;
      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const x = (canvasWidth - newWidth) / 2;
      const dpr = window.devicePixelRatio || 1;
      const verticalOffset = isMobile ? 20 * dpr : 40 * dpr;
      const horizontalOffset = 16 * dpr;
      const y = (canvasHeight - newHeight) / 2 + verticalOffset;
      context.drawImage(img, x + horizontalOffset, y, newWidth, newHeight);
      lastFrameIndex.current = index;
    }
  };

  const animate = () => {
    const lerpFactor = 0.12;
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/50 to-slate-950/80 md:from-slate-950/20 md:via-slate-950/40 md:to-slate-950/75 z-10" />
      </div>
      <div className="relative z-10 -mt-[100vh] min-h-screen w-full flex items-center justify-center">
        {children}
      </div>
      <div className="h-[60vh]" />
    </section>
  );
};

export default HeroScrollAnimation;
