import { useEffect } from 'react';

/**
 * Vergrendelt de achtergrondpagina volledig zolang `active` true is (bedoeld
 * voor modals). `overflow: hidden` alleen is op iOS Safari onvoldoende omdat
 * de pagina daar nog steeds kan bewegen via touch/momentum-scroll; daarom
 * zetten we de body vast met `position: fixed` en compenseren we de
 * scrollpositie via `top`, zoals gebruikelijk voor een robuuste scroll-lock.
 *
 * Elke keer dat het effect opnieuw draait (dus ook bij React Strict Mode's
 * mount→cleanup→mount) leest en herstelt het de scrollpositie/body-styles
 * binnen diezelfde cyclus, dus dit blijft correct zonder module-level state.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const previousStyle = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    // Voorkom layout-shift wanneer de (desktop) scrollbar verdwijnt.
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(previousStyle.paddingRight || '0') || 0;
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      body.style.position = previousStyle.position;
      body.style.top = previousStyle.top;
      body.style.left = previousStyle.left;
      body.style.right = previousStyle.right;
      body.style.width = previousStyle.width;
      body.style.overflow = previousStyle.overflow;
      body.style.paddingRight = previousStyle.paddingRight;
      // Geen "smooth" scroll — de gebruiker moet exact terugkomen waar die was.
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
