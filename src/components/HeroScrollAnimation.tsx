import React, { useEffect, useRef, useState } from 'react';

// MP4 (H.264) i.p.v. WebM — Safari (iOS/macOS) ondersteunt WebM niet
// betrouwbaar, waardoor de video daar nooit laadde en de hero onzichtbaar
// bleef. MP4 wordt overal ondersteund, dus één bron volstaat. 24fps, ~4s,
// ~1,6MB — kleiner dan de vorige 60fps-versie, zelfde keyframe-interval-1
// encoding (elk frame is een keyframe) voor soepel scrubben.
const HERO_VIDEO_SRC =
  'https://zinjkdujrvtykoglpwfe.supabase.co/storage/v1/object/public/24fps%20front%20page/24%20fps%20pc%20.mp4';

// Valt terug op de donkere achtergrond (zonder video) als 'loadeddata' niet
// binnen deze tijd vuurt en er ook geen 'error' is opgetreden — voorkomt dat
// de hero voor altijd onzichtbaar blijft bij een laadprobleem dat geen
// duidelijke 'error' oplevert (bv. trage verbinding, ontbrekende bron).
const LOAD_TIMEOUT_MS = 8000;

// Start het downloaden van de video pas als de hero-sectie dit dichtbij
// nadert, i.p.v. meteen bij het laden van de pagina — de video is met
// preload="auto" een relatief zware download die anders bandbreedte/
// prioriteit wegneemt van kritiekere content (LCP). 200px marge zodat het
// laden al begint vlak voordat de sectie daadwerkelijk in beeld komt.
const INTERSECTION_ROOT_MARGIN = '200px';

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

// Marge t.o.v. de exacte duur waarbinnen we het bestand als "volledig
// gebufferd" beschouwen — zelden exact gelijk, vandaar een kleine tolerantie.
const FULLY_BUFFERED_EPSILON = 0.1;

// 'canplaythrough' is slechts een schatting van de browser (genoeg om
// lineair af te spelen bij het huidige downloadtempo) — geen garantie dat
// het hele bestand binnen is. In de praktijk vuurde dat te vroeg, met
// haperend scrubben tot gevolg zodra er alsnog data moest worden opgehaald.
// Daarom vertrouwen we uitsluitend op een expliciete vergelijking van
// `buffered` t.o.v. de volledige duur.
function isFullyBuffered(video: HTMLVideoElement) {
  const duration = video.duration;
  if (!duration || !isFinite(duration)) return false;
  const buffered = video.buffered;
  if (buffered.length === 0) return false;
  return buffered.end(buffered.length - 1) >= duration - FULLY_BUFFERED_EPSILON;
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
  // Pas true zodra de sectie het viewport nadert (IntersectionObserver) —
  // tot die tijd krijgt de video geen src/preload, zodat er niets gedownload
  // wordt.
  const [shouldLoad, setShouldLoad] = useState(false);
  // Losgekoppeld van `isReady`: de sectie mag al zichtbaar zijn/faden zodra
  // het eerste frame er staat ('loadeddata'), maar scroll mag pas de video
  // gaan aansturen zodra er genoeg gebufferd is — anders hapert scrubbing op
  // trage mobiele verbindingen doordat er nog op data gewacht moet worden.
  const [canScrub, setCanScrub] = useState(false);

  const durationRef = useRef(0);
  const lastSeekTime = useRef(-1);
  // Ruwe, ongefilterde scroll-progressie (1-op-1 met de actuele scrollpositie
  // — bepaalt dus de totale scrollafstand/paginalengte, niet de smoothing).
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
    // Mobiel: kleine correctie naar rechts (-4 -> 6), zoals gevraagd.
    // Desktop-waarde (16) blijft ongewijzigd.
    const horizontalOffset = (mobile ? 6 : 16) * scaleAdjustment;
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
    // Onderscheid tussen kleine, continue scroll-updates (Mac-trackpad) en
    // een enkele grote sprong (Windows-muiswiel-tick), puur op basis van hoe
    // ver currentProgress nog achterloopt op targetProgress — niet via een
    // aparte smoothing-laag die op alle input gelijk drukt (die maakte ook
    // trackpad-scrollen trager, wat niet de bedoeling was).
    //
    // Bij trackpad-scrollen blijft dat gat klein, omdat elk scroll-event al
    // een kleine stap is — dan gebruiken we SMALL_JUMP_FACTOR, ongeveer de
    // oorspronkelijke, directe snelheid van vóór alle Windows-tuning. Bij een
    // enkele grote muiswiel-sprong is het gat in één klap groot; dan schakelt
    // hij naar LARGE_JUMP_FACTOR en haalt hij het gat sterk vertraagd in —
    // dat gat krimpt daarna geleidelijk, dus zodra het weer onder de
    // drempel zakt versnelt de laatste stukjes weer naar het normale tempo.
    const LARGE_JUMP_THRESHOLD = 0.05;
    const SMALL_JUMP_FACTOR = 0.08;
    const LARGE_JUMP_FACTOR = 0.03;

    const diff = targetProgress.current - currentProgress.current;
    const factor = Math.abs(diff) > LARGE_JUMP_THRESHOLD ? LARGE_JUMP_FACTOR : SMALL_JUMP_FACTOR;
    currentProgress.current += diff * factor;

    seekTo(currentProgress.current);

    if (Math.abs(diff) > 0.0001) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      animationFrameId.current = null;
    }
  };

  const handleScroll = () => {
    if (!sectionRef.current || !canScrub) return;
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

  // Bepaalt wanneer de video-download start: pas zodra de sectie (bijna) in
  // beeld komt, niet al bij het mounten van de pagina.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: INTERSECTION_ROOT_MARGIN }
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Laadt de video en bepaalt wanneer 'm getoond mag worden. Metadata geeft
  // de duur (nodig om currentTime te kunnen zetten — in sommige browsers
  // werkt seeken pas zodra readyState >= HAVE_METADATA). "loadeddata" geeft
  // aan dat het eerste frame daadwerkelijk gedecodeerd/te tonen is, zodat we
  // pas dan faden i.p.v. een witte flits te tonen. Scrubben zelf wordt pas
  // vrijgegeven zodra het bestand voldoende gebufferd is (zie canScrub).
  // Wacht op `shouldLoad` zodat deze pas opstart nadat de video daadwerkelijk
  // een src heeft gekregen (zie IntersectionObserver hierboven) — anders zou
  // de LOAD_TIMEOUT_MS-countdown al lopen vóórdat er iets te laden viel.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    // Twee onafhankelijke "klaar"-vlaggen: de sectie mag al zichtbaar
    // worden (settledReveal) ruim voordat scrubben veilig is (settledScrub).
    let settledReveal = false;
    let settledScrub = false;

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration || 0;
      applyVideoTransform();
    };
    const handleLoadedData = () => {
      settledReveal = true;
      setIsReady(true);
    };
    const handleError = () => {
      settledReveal = true;
      settledScrub = true;
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
    // 'progress' vuurt herhaaldelijk terwijl er data binnenkomt — bij elke
    // update checken of `buffered` inmiddels echt tot (bijna) het einde
    // reikt (isFullyBuffered). Geen 'canplaythrough' meer als (mede)signaal:
    // die schatting bleek onbetrouwbaar vroeg te vuren.
    const handleProgress = () => {
      if (settledScrub) return;
      if (isFullyBuffered(video)) {
        settledScrub = true;
        setCanScrub(true);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('progress', handleProgress);

    // Kan al geladen zijn (bv. uit browsercache) vóórdat dit effect draait.
    if (video.readyState >= video.HAVE_METADATA) handleLoadedMetadata();
    if (video.readyState >= video.HAVE_CURRENT_DATA) handleLoadedData();
    handleProgress();

    // Vangnet, in twee delen — werkt ook als 'progress' nooit voldoende vuurt:
    // - geen 'loadeddata' én geen 'error' binnen LOAD_TIMEOUT_MS: val terug
    //   op de donkere achtergrond i.p.v. voor altijd onzichtbaar blijven;
    // - wél geladen maar nooit volledig gebufferd bevestigd: geef scrubben
    //   alsnog vrij i.p.v. de hero permanent niet-interactief te laten.
    const timeoutId = window.setTimeout(() => {
      if (!settledReveal) {
        settledReveal = true;
        setHasError(true);
        setIsReady(true);
      }
      if (!settledScrub) {
        settledScrub = true;
        setCanScrub(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('progress', handleProgress);
      window.clearTimeout(timeoutId);
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (canScrub) {
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
  }, [canScrub]);

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
              src={shouldLoad ? HERO_VIDEO_SRC : undefined}
              muted
              playsInline
              autoPlay
              preload={shouldLoad ? 'auto' : 'none'}
              className="absolute block"
              // fetchpriority is (nog) niet getypeerd op VideoHTMLAttributes in
              // @types/react (wel op img/link/script) — via spread zetten we
              // 'm alsnog als los DOM-attribuut. Signaleert de browser dat deze
              // download voorrang mag krijgen boven niet-kritieke afbeeldingen
              // verderop op de pagina.
              {...({ fetchpriority: 'high' } as React.HTMLAttributes<HTMLVideoElement>)}
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
