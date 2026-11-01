import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Layout from '../site/Layout';
import { goTo, SUPPORT_EMAIL, useReveal } from '../site/util';
import { TOPICS } from '../site/faq';

export default function HelpPage() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const topics = useMemo(() => TOPICS.map((t) => ({ ...t, items: t.items.filter(([qq, a]) => !query || (qq + ' ' + a).toLowerCase().includes(query)) })).filter((t) => t.items.length), [query]);
  const count = topics.reduce((n, t) => n + t.items.length, 0);
  useReveal(query);
  return (
    <Layout>
      <section className="bg-[var(--field)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-24 flex flex-col gap-8">
          <h1 className="display text-[60px] sm:text-[88px] xl:text-[112px]">
            <span className="line"><span>How can we help?</span></span>
          </h1>
          <label className="fade-in relative max-w-3xl" style={{ ['--i' as string]: 1 }}>
            <span className="sr-only">Search the help centre</span>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--soft-ink)]" size={24} aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try reminders, cancel or payday"
              className="w-full min-h-[68px] rounded-full bg-white pl-16 pr-6 text-[20px] outline-none focus-visible:outline-3 focus-visible:outline-[var(--accent)]" />
          </label>
          <div className="fade-in flex flex-wrap gap-2.5" style={{ ['--i' as string]: 2 }}>
            {TOPICS.map((t) => (
              <button key={t.id} onClick={() => { setQ(''); setTimeout(() => goTo(t.id), 30); }} className="btn btn-light min-h-[46px] text-[16px]">{t.title}</button>
            ))}
          </div>
          {query && <p className="text-[17px]" aria-live="polite">{count ? `${count} answer${count === 1 ? '' : 's'} for "${q.trim()}"` : `No answers for "${q.trim()}". Try another word, or contact us below.`}</p>}
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-20 md:py-28 flex flex-col gap-20">
        {topics.map((t) => (
          <div key={t.id} id={t.id} className="grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-12 scroll-mt-32">
            <h2 className="display text-[40px] md:text-[56px]" data-reveal>{t.title}</h2>
            <div className="flex flex-col">
              {t.items.map(([qq, a], i) => (
                <details key={qq} open={!!query} className="bg-[var(--card)] rounded-[22px] px-6 mb-3 transition-colors duration-200 hover:bg-white" data-reveal style={{ ['--i' as string]: i + 1 }}>
                  <summary className="flex items-center justify-between gap-6 py-5 text-[20px] font-semibold">{qq}<Plus className="plus shrink-0" size={24} /></summary>
                  <p className="answer pb-6 text-[18px] leading-[1.6] max-w-[62ch]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-[var(--field-deep)] text-[var(--ground)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_1fr] gap-10 items-end">
          <div className="flex flex-col gap-5">
            <h2 className="display text-[48px] md:text-[76px] text-white" data-reveal>Still stuck?</h2>
            <p className="text-[20px] leading-[1.55] max-w-[44ch] text-[var(--on-deep)]" data-reveal style={{ ['--i' as string]: 1 }}>
              {SUPPORT_EMAIL ? 'Email us and a real person will reply.' : 'Our support inbox opens at launch. Until then, the answers above cover the most common questions.'} Please never send passwords, card numbers or medicine details.
            </p>
          </div>
          <div className="flex flex-wrap gap-3" data-reveal style={{ ['--i' as string]: 2 }}>
            {SUPPORT_EMAIL && <a href={`mailto:${SUPPORT_EMAIL}?subject=DayStead%20help`} className="btn btn-light">Email {SUPPORT_EMAIL}</a>}
            <Link to="/delete-account" className="btn btn-field">Delete my account</Link>
            <Link to="/privacy" className="btn btn-field">Privacy</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
