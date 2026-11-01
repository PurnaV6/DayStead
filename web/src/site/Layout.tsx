import { useEffect, useState, type ReactNode } from 'react';
import { APP_STORE_URL, GOOGLE_PLAY_URL, SUPPORT_EMAIL, goTo } from './util';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Shared frame for every page: launch bar, plain navigation, page, designed footer.
const YEAR = new Date().getFullYear();

export function StoreButtons({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  const items: [string, string, string][] = [['Google Play', GOOGLE_PLAY_URL, 'Get it on'], ['App Store', APP_STORE_URL, 'Download on the']];
  const base = 'inline-flex flex-col justify-center min-h-[58px] min-w-[176px] px-6 rounded-full text-left transition-[transform,background-color] duration-200 active:scale-[.97]';
  const look = tone === 'ink' ? 'bg-[var(--ink)] text-[var(--ground)] hover:bg-[var(--accent)]' : 'bg-[var(--ground)] text-[var(--ink)] hover:bg-white';
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(([store, url, lead]) => {
        const body = (<><span className="text-[12px] leading-none opacity-75">{url ? lead : 'Coming soon on'}</span><span className="text-[18px] font-semibold leading-tight">{store}</span></>);
        return url
          ? <a key={store} href={url} className={`${base} ${look}`}>{body}</a>
          : <span key={store} role="note" aria-label={`${store}: coming soon`} className={`${base} ${look} cursor-default`}>{body}</span>;
      })}
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [['/', 'Home'], ['/pricing', 'Pricing'], ['/support', 'Help']];
  return (
    <header className="sticky top-0 z-40 bg-[var(--ground)]">
      <div className="bg-[var(--ink)] text-[var(--on-deep)] text-[14px]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-2.5 flex justify-center gap-2 text-center">
          <span>Launching first on Android. 1 month free, then £3.99 a month.</span>
          <Link to="/pricing" className="hidden sm:inline font-semibold underline underline-offset-4">See pricing</Link>
        </div>
      </div>
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-[26px] font-bold tracking-[-0.04em]" aria-label="DayStead home"><img src="/logo-mark.png" alt="" width="32" height="31" />DayStead.</Link>
        <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-[16px] font-medium">
          {links.slice(1).map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `link-u py-1 ${isActive ? 'font-semibold' : ''}`}>{label}</NavLink>
          ))}
          <Link to="/" onClick={() => setTimeout(() => goTo('get'), 50)} className="btn btn-ink">Get the app</Link>
        </nav>
        <button className="md:hidden w-11 h-11 -mr-2 flex items-center justify-center" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Main" className="md:hidden absolute inset-x-0 top-full bg-[var(--ground)] shadow-[0_24px_40px_rgba(25,61,49,.12)] px-5 pb-8 pt-2 flex flex-col">
          {links.map(([to, label], i) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="fade-in py-4 text-[32px] font-semibold tracking-[-0.03em]" style={{ ['--i' as string]: i - 3 }}>{label}</Link>
          ))}
          <Link to="/" onClick={() => { setOpen(false); setTimeout(() => goTo('get'), 50); }} className="btn btn-ink mt-4 self-start">Get the app</Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--field-deep)] text-[var(--on-deep)]">
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 pt-20 pb-10 flex flex-col gap-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-[16px]">
          <div className="col-span-2 flex flex-col gap-5 max-w-sm">
            <p className="text-[24px] leading-snug font-medium">Bills, medicines and appointments, kept in order on your phone.</p>
            <StoreButtons tone="light" />
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-white">DayStead</h2>
            <Link className="link-u self-start" to="/">Home</Link>
            <Link className="link-u self-start" to="/pricing">Pricing</Link>
            <Link className="link-u self-start" to="/support">Help centre</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-white">Your account</h2>
            <Link className="link-u self-start" to="/privacy">Privacy</Link>
            <Link className="link-u self-start" to="/terms">Terms</Link>
            <Link className="link-u self-start" to="/delete-account">Delete account</Link>
            {SUPPORT_EMAIL && <a className="link-u self-start" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>}
          </div>
        </div>
        <p aria-hidden="true" className="display text-[18.5vw] md:text-[15vw] leading-[.8] text-white -ml-[0.04em] select-none">DayStead.</p>
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-[14px] text-[#b9cbbf]">
          <p>© {YEAR} DayStead by Provifi. Your day, in order.</p>
          <p>Photographs from Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:p-3 focus:bg-white">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
    </div>
  );
}
