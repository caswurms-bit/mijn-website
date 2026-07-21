import React, { useEffect, useRef, useState } from 'react';

// MP4 (H.264) i.p.v. WebM — Safari (iOS/macOS) ondersteunt WebM niet
// betrouwbaar, waardoor de video daar nooit laadde en de hero onzichtbaar
// bleef. MP4 wordt overal ondersteund, dus één bron volstaat. 60fps met
// keyframe-interval 1 (elk frame is een keyframe) voor soepel scrubben.
const HERO_VIDEO_SRC =
  'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/web%20heropage/60%20pfs%20pc.mp4';

// Valt terug op de donkere achtergrond (zonder video) als 'loadeddata' niet
// binnen deze tijd vuurt en er ook geen 'error' is opgetreden — voorkomt dat
// de hero voor altijd onzichtbaar blijft bij een laadprobleem dat geen
// duidelijke 'error' oplevert (bv. trage verbinding, ontbrekende bron).
const LOAD_TIMEOUT_MS = 8000;

// Kleine marge t.o.v. de exacte duur — sommige browsers seeken niet
// betrouwbaar naar precies `duration`, vlak ervoor werkt altijd en is
// visueel niet te onderscheiden van het allerlaatste frame.
const SEEK_END_EPSILON = 0.05;
// Minimale tijdsprong voordat we `video.currentTime` opnieuw zetten —
// voorkomt overbodige seeks (en dus werk) bij subpixel scroll-updates.
const SEEK_MIN_DELTA = 0.01;

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

interface HeroScrollAnimationProps {
  children?: React.ReactNode;
}

const HeroScrollAnimation: React.FC<HeroScrollAnimationProps> = ({ children }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const durationRef = useRef(0);
  const lastSeekTime = useRef(-1);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  // iOS Safari decodeert/toont geen enkel videoframe totdat de video echt
  // een keer heeft gespeeld, ook al zijn metadata/loadeddata al gevuurd —
  // vandaar autoplay (mag: muted + playsInline) gevolgd door een meteen
  // erop volgende pause, puur om dat eerste frame te forceren. Deze vlag
  // zorgt dat we dat maar één keer doen.
  const hasAutoPaused = useRef(false);

  // Positioneert en schaalt de video exact zoals voorheen elk canvas-frame
  // werd getekend: eerst een "cover"-ratio bepalen, daarna bewust kleiner
  // maken (scaleAdjustment) zodat de pc rustiger/minder dominant oogt, met
  // dezelfde verticale/horizontale offsets voor mobiel vs. desktop.
  const applyVideoTransform = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.videoWidth || !video.videoHeight) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const mobile = isMobileViewport();

    const baseRatio = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);
    const scaleAdjustment = mobile ? 0.56 : 0.54;
    const ratio = baseRatio * scaleAdjustment;
    const newWidth = videoWidth * ratio;
    const newHeight = videoHeight * ratio;
    const x = (containerWidth - newWidth) / 2;
    const verticalOffset = (mobile ? 94 : 60) * scaleAdjustment;
    const horizontalOffset = (mobile ? -4 : 16) * scaleAdjustment;
    const y = (containerHeight - newHeight) / 2 + verticalOffset;

    video.style.width = `${newWidth}px`;
    video.style.height = `${newHeight}px`;
    video.style.left = `${x + horizontalOffset}px`;
    video.style.top = `${y}px`;
  };

  const seekTo = (progress: number) => {
    const video = videoRef.current;
    const duration = durationRef.current;
    if (!video || duration <= 0) return;
    const maxTime = Math.max(0, duration - SEEK_END_EPSILON);
    const targetTime = progress * maxTime;
    if (Math.abs(targetTime - lastSeekTime.current) < SEEK_MIN_DELTA) return;
    lastSeekTime.current = targetTime;
    video.currentTime = targetTime;
  };

  const animate = () => {
    // Zelfde vloeiende "glide" als voorheen i.p.v. 1-op-1 met de scroll meeschieten.
    const lerpFactor = 0.08;
    const diff = targetProgress.current - currentProgress.current;
    currentProgress.current += diff * lerpFactor;

    seekTo(currentProgress.current);

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
    applyVideoTransform();
  };

  // Laadt de video en bepaalt wanneer 'm getoond mag worden. Metadata geeft
  // de duur (nodig om currentTime te kunnen zetten — in sommige browsers
  // werkt seeken pas zodra readyState >= HAVE_METADATA). "loadeddata" geeft
  // aan dat het eerste frame daadwerkelijk gedecodeerd/te tonen is, zodat we
  // pas dan faden i.p.v. een witte flits te tonen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let settled = false;

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      applyVideoTransform();
    };
    const handleLoadedData = () => {
      settled = true;
      setIsReady(true);
    };
    const handleError = () => {
      settled = true;
      setHasError(true);
      setIsReady(true);
    };
    // iOS Safari toont pas een gedecodeerd frame nadat de video echt heeft
    // gespeeld — 'playing' vuurt pas zodra dat frame zichtbaar is (in
    // tegenstelling tot 'loadeddata', dat op iOS soms te vroeg vuurt zonder
    // dat er al iets getekend is). Meteen pauzeren zodra dat gebeurt: we
    // willen alleen dat ene frame forceren, niet dat de video blijft spelen
    // — de bestaande seekTo-logica stuurt daarna gewoon de positie aan.
    const handlePlaying = () => {
      if (hasAutoPaused.current) return;
      hasAutoPaused.current = true;
      video.pause();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('playing', handlePlaying);

    // Kan al geladen zijn (bv. uit browsercache) vóórdat dit effect draait.
    if (video.readyState >= video.HAVE_METADATA) handleLoadedMetadata();
    if (video.readyState >= video.HAVE_CURRENT_DATA) handleLoadedData();

    // Vangnet: geen 'loadeddata' én geen 'error' binnen LOAD_TIMEOUT_MS (bv.
    // trage verbinding of een bron die stil blijft hangen) — val alsnog
    // terug op de donkere achtergrond i.p.v. voor altijd onzichtbaar blijven.
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setHasError(true);
      setIsReady(true);
    }, LOAD_TIMEOUT_MS);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('playing', handlePlaying);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      applyVideoTransform();
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
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'} ${hasError ? '' : 'bg-white'}`}
        >
          {!hasError && (
            <video
              ref={videoRef}
              src={HERO_VIDEO_SRC}
              muted
              playsInline
              autoPlay
              preload="auto"
              className="absolute block"
            />
          )}
        </div>
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
