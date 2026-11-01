import { Link } from 'react-router-dom';
import { Bell, CalendarDays, Check, Lock, Pill, PoundSterling, Users } from 'lucide-react';

// The public showcase page. DayStead is a phone app; this page explains it and links to the stores.
// When a store listing goes live, put its link here and the button stops saying "Coming soon".
const GOOGLE_PLAY_URL = '';
const APP_STORE_URL = '';
const YEAR = new Date().getFullYear();

const FEATURES = [
  { icon: PoundSterling, title: 'Bills, before payday', text: 'See what is due this month and how much to keep aside before you are next paid. Quick-add common UK bills like council tax, energy and broadband.' },
  { icon: Pill, title: 'Medicine reminders', text: 'Reminders at the times you were prescribed, with an alarm-style option on Android. Mark doses as taken or skipped. DayStead never gives medical advice.' },
  { icon: CalendarDays, title: 'Appointments and to-dos', text: 'GP visits, school forms, renewals. Everything with a date sits in one calm list for the week ahead.' },
  { icon: Users, title: 'For you, or someone you look after', text: 'Keep track for a parent, partner or child as well as yourself. Each item shows who it is for.' },
];

function StoreButton({ store, url }: { store: 'Google Play' | 'App Store'; url: string }) {
  const label = store === 'Google Play' ? 'Get it on' : 'Download on the';
  const body = (
    <>
      <span className="text-[11px] leading-none opacity-80">{url ? label : 'Coming soon to'}</span>
      <span className="text-[17px] font-semibold leading-tight">{store}</span>
    </>
  );
  const style = 'min-h-[52px] min-w-[170px] px-5 rounded-xl flex flex-col justify-center text-left';
  return url ? (
    <a href={url} className={`${style} bg-[var(--ds-ink)] text-white hover:opacity-90`}>{body}</a>
  ) : (
    <span aria-label={`${store}: coming soon`} className={`${style} bg-white border border-[var(--ds-line)] text-[var(--ds-ink)]`}>{body}</span>
  );
}

// An illustration of the app's Today screen, drawn in HTML so it stays sharp and light.
function PhonePreview() {
  return (
    <div aria-hidden="true" className="w-[280px] shrink-0 rounded-[40px] bg-[var(--ds-ink)] p-3 shadow-2xl">
      <div className="rounded-[30px] bg-[var(--ds-paper)] p-4 flex flex-col gap-3 h-[540px] overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold tracking-tight">DayStead.</span>
          <span className="text-[8px] border border-[var(--ds-line)] rounded-full px-2 py-0.5 text-[var(--ds-muted)]">BY PROVIFI</span>
        </div>
        <p className="text-[8px] font-bold tracking-widest text-[var(--ds-muted)]">MONDAY 2 NOVEMBER</p>
        <p className="text-2xl font-semibold tracking-tight">Hello, Sam.</p>
        <div className="rounded-2xl bg-[#EDF2E9] p-3 flex flex-col gap-1">
          <p className="text-[11px] font-semibold">Money needed before payday</p>
          <p className="text-xl font-semibold">£412.50</p>
          <p className="text-[9px] text-[var(--ds-muted)]">Payday · Friday 27 November</p>
        </div>
        <div className="rounded-2xl bg-[var(--ds-ink)] p-3 text-white">
          <p className="text-[8px] font-bold tracking-widest text-[#ACC7B7]">STILL TO SET ASIDE · NOVEMBER</p>
          <p className="text-2xl font-medium">£642.50</p>
        </div>
        {[
          ['Council tax', '£148.00', 'Fri 6 Nov · Bills'],
          ['Morning tablets', '8:00', 'Today · For Mum'],
          ['Dentist', '14:30', 'Thu 5 Nov · Appointment'],
        ].map(([title, right, sub]) => (
          <div key={title} className="rounded-2xl bg-white border border-[var(--ds-line)] p-3">
            <div className="flex justify-between text-[12px] font-semibold"><span>{title}</span><span>{right}</span></div>
            <p className="text-[9px] text-[var(--ds-muted)] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--ds-paper)] text-[var(--ds-ink)]">
      <header className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-[26px] font-bold tracking-tight">DayStead.</span>
          <span className="hidden sm:inline text-[10px] font-bold tracking-[.18em] text-[var(--ds-muted)]">BY PROVIFI</span>
        </Link>
        <nav className="flex gap-5 text-sm font-medium">
          <a href="#features" className="hidden sm:inline">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/support">Help</Link>
        </nav>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-5 pt-6 pb-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-[44px] md:text-[60px] leading-[1.05] font-semibold tracking-tight">Your day,<br />in order.</h1>
            <p className="text-lg md:text-xl leading-relaxed text-[var(--ds-muted)] max-w-xl">
              Bills, medicines and appointments in one calm app. Know what is due, how much to keep aside before payday, and get reminded in time.
            </p>
            <div className="flex flex-wrap gap-3">
              <StoreButton store="Google Play" url={GOOGLE_PLAY_URL} />
              <StoreButton store="App Store" url={APP_STORE_URL} />
            </div>
            <p className="text-sm text-[var(--ds-muted)]">1 month free, then £3.99 a month or £35.99 a year. Android first; iPhone coming later.</p>
          </div>
          <PhonePreview />
        </section>

        <section id="features" className="bg-white border-y border-[var(--ds-line)]">
          <div className="max-w-6xl mx-auto px-5 py-16 flex flex-col gap-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">Everything with a date, in one place.</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[22px] border border-[var(--ds-line)] bg-[var(--ds-paper)] p-6 flex flex-col gap-3">
                  <span className="w-11 h-11 rounded-xl bg-[#EDF2E9] flex items-center justify-center"><Icon size={22} color="var(--ds-accent)" /></span>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="leading-relaxed text-[var(--ds-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8">
          {[
            [Lock, 'Private on your lock screen', 'Reminders just say "DayStead reminder", so nobody glancing at your phone sees what a bill or medicine is.'],
            [Bell, 'Reminders that follow up', 'If a bill is still unpaid or a dose unmarked, DayStead marks it in red and reminds you once more.'],
            [Check, 'Your data stays yours', 'Export or delete your account at any time. Payments are handled by Google or Apple; DayStead never sees your card details.'],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Lock;
            return (
              <div key={title as string} className="flex flex-col gap-2">
                <I size={22} color="var(--ds-accent)" />
                <h3 className="text-lg font-semibold">{title as string}</h3>
                <p className="leading-relaxed text-[var(--ds-muted)]">{text as string}</p>
              </div>
            );
          })}
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-5 pb-20">
          <div className="rounded-[28px] bg-[var(--ds-ink)] text-white p-8 md:p-12 flex flex-col md:flex-row gap-10 md:items-center">
            <div className="flex-1 flex flex-col gap-3">
              <p className="text-[11px] font-bold tracking-[.18em] text-[#ACC7B7]">PRICING</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Try it free for a month.</h2>
              <p className="text-[#CEDDD3] leading-relaxed max-w-lg">
                Start your free month in the app. You add a payment method in Google Play (or the App Store) but pay nothing today. We remind you 3 days before the free month ends, and you can cancel any time before then without being charged.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="rounded-2xl bg-white/10 p-6 min-w-[180px]">
                <p className="text-sm text-[#CEDDD3]">Monthly</p>
                <p className="text-3xl font-semibold mt-1">£3.99</p>
                <p className="text-sm text-[#CEDDD3]">a month</p>
              </div>
              <div className="rounded-2xl bg-white p-6 min-w-[180px] text-[var(--ds-ink)]">
                <p className="text-sm text-[var(--ds-muted)]">Yearly · save 25%</p>
                <p className="text-3xl font-semibold mt-1">£35.99</p>
                <p className="text-sm text-[var(--ds-muted)]">a year</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--ds-line)]">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row gap-4 justify-between text-sm text-[var(--ds-muted)]">
          <p>© {YEAR} DayStead by Provifi. Your day, in order.</p>
          <nav className="flex flex-wrap gap-5">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/support">Help</Link>
            <Link to="/delete-account">Delete account</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
