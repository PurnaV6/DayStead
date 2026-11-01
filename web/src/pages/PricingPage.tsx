import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import Layout, { StoreButtons } from '../site/Layout';
import { useReveal } from '../site/util';
import { TOPICS } from '../site/faq';

const INCLUDED = [
  'Unlimited bills, medicines, appointments and to-dos',
  'Money needed before payday, updated as you mark bills paid',
  'Bill reminders 3 days before, and follow-ups for missed ones',
  'Medicine reminders, with an alarm-style option on Android',
  'Items for the people you look after, each labelled',
  'Monthly breakdown and this month against last month',
  'Private lock-screen reminders',
  'Sync across your phones, export and delete at any time',
];

export default function PricingPage() {
  useReveal();
  const [yearly, setYearly] = useState(true);
  const billing = TOPICS.find((t) => t.id === 'billing')!;
  return (
    <Layout>
      <section className="max-w-[1320px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-24 md:pb-32 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div className="flex flex-col gap-7">
          <h1 className="display text-[60px] sm:text-[88px] xl:text-[112px]">
            <span className="line"><span style={{ ['--i' as string]: 0 }}>One plan.</span></span>
            <span className="line"><span style={{ ['--i' as string]: 1 }}>All of it.</span></span>
          </h1>
          <p className="fade-in text-[20px] md:text-[23px] leading-[1.45] max-w-[34ch]" style={{ ['--i' as string]: 1 }}>
            Every feature is in every plan. Try DayStead free for a month, then choose monthly or yearly.
          </p>
        </div>
        <div className="fade-in rounded-[36px] bg-[var(--ink)] text-[var(--ground)] p-8 md:p-10 flex flex-col gap-6" style={{ ['--i' as string]: 2 }}>
          <div role="radiogroup" aria-label="Billing period" className="self-start flex rounded-full bg-white/10 p-1.5">
            {[['Yearly', true], ['Monthly', false]].map(([label, val]) => (
              <button key={String(label)} role="radio" aria-checked={yearly === val} onClick={() => setYearly(val as boolean)}
                className={`min-h-[44px] px-6 rounded-full text-[16px] font-semibold transition-colors duration-200 ${yearly === val ? 'bg-[var(--ground)] text-[var(--ink)]' : 'text-[var(--on-deep)] hover:text-white'}`}>
                {label as string}
              </button>
            ))}
          </div>
          <div>
            <p className="display tnum text-[88px] md:text-[112px]" aria-live="polite">{yearly ? '£35.99' : '£3.99'}</p>
            <p className="text-[19px] text-[var(--on-deep)] mt-2">{yearly ? 'a year. That is about £3 a month, 25% less than monthly.' : 'a month. Cancel any time in Google Play.'}</p>
          </div>
          <p className="text-[18px] font-semibold text-white">First month free on both plans.</p>
          <StoreButtons tone="light" />
        </div>
      </section>

      <section className="bg-[var(--field)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <h2 className="display text-[48px] md:text-[76px]" data-reveal>What you get</h2>
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {INCLUDED.map((t, i) => (
              <li key={t} className="flex gap-4 text-[19px] leading-[1.45]" data-reveal style={{ ['--i' as string]: (i % 4) + 1 }}>
                <span className="w-8 h-8 rounded-full bg-[var(--ink)] text-white flex items-center justify-center shrink-0 mt-0.5"><Check size={18} /></span>{t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 flex flex-col gap-14">
        <div className="flex flex-col gap-5 max-w-3xl">
          <h2 className="display text-[48px] md:text-[76px]" data-reveal>How the free month works</h2>
          <p className="text-[20px] leading-[1.55]" data-reveal style={{ ['--i' as string]: 1 }}>The store looks after payment. DayStead never sees your card.</p>
        </div>
        <ol className="grid md:grid-cols-4 gap-4">
          {[
            ['Day 1', 'Start your free month in the app. Google Play asks for a payment method and checks it. You pay £0.'],
            ['Day 28', 'The app reminds you that your free month ends in 3 days. Google usually emails you too.'],
            ['Day 31', `Your first payment of ${yearly ? '£35.99' : '£3.99'} is taken, then on the same date each ${yearly ? 'year' : 'month'}.`],
            ['Any time', 'Cancel in Google Play, Subscriptions. Cancel before the free month ends and you are never charged.'],
          ].map(([when, what], i) => (
            <li key={when} className={`rounded-[28px] p-7 flex flex-col gap-4 min-h-[240px] ${i === 2 ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--field)]'}`} data-reveal style={{ ['--i' as string]: i + 1 }}>
              <span className="display text-[44px]">{when}</span>
              <span className="text-[18px] leading-[1.5]">{what}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[var(--field-deep)] text-[var(--ground)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 grid lg:grid-cols-[1fr_1.5fr] gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="display text-[48px] md:text-[76px] text-white" data-reveal>Billing questions</h2>
            <Link to="/support" className="link-u self-start text-[18px] font-semibold" data-reveal style={{ ['--i' as string]: 1 }}>More answers in the help centre</Link>
          </div>
          <div className="flex flex-col">
            {billing.items.map(([q, a], i) => (
              <details key={q} className="group py-2" data-reveal style={{ ['--i' as string]: (i % 4) + 1 }}>
                <summary className="flex items-center justify-between gap-6 py-4 text-[21px] font-semibold text-white">{q}<Plus className="plus shrink-0" size={26} /></summary>
                <p className="answer pb-5 text-[18px] leading-[1.6] text-[var(--on-deep)] max-w-[60ch]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
