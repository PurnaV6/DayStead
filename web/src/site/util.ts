import { useEffect } from 'react';

// When a store listing goes live, put its link here; every "Get the app" button follows it.
export const GOOGLE_PLAY_URL = '';
export const APP_STORE_URL = '';
// Set this once the daystead.app mailbox exists.
export const SUPPORT_EMAIL = '';

// Scroll to a section on the page (the site uses hash routing, so plain #anchors would change page).
export function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Turns on the entrance animations: elements with data-reveal rise in once as they enter.
export function useReveal(dep?: unknown) {
  useEffect(() => {
    document.documentElement.classList.add('js');
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

