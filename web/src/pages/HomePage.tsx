import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout, { StoreButtons } from '../site/Layout';
import { useReveal } from '../site/util';
import { BillsScreen, LockScreen, MedicinesScreen, Phone, TodayScreen } from '../site/PhoneUI';

const STRIP = ['Council tax', 'Rent', 'Morning tablets', 'Energy', 'Dentist at 2:30', 'TV licence', 'Repeat prescription', 'Broadband', 'School forms', 'Car insurance', 'Evening tablets', 'Water'];

// Sample household for the payday sum. Same rule as the app: unpaid bills from the 1st up to and including payday.
const SAMPLE: { name: string; day: number; pence: number }[] = [
  { name: 'Rent', day: 1, pence: 85000 },
  { name: 'Council tax', day: 6, pence: 14800 },
  { name: 'Energy', day: 15, pence: 9600 },
  { name: 'Broadband', day: 18, pence: 3200 },
  { name: 'Mobile phone', day: 22, pence: 1800 },
  { name: 'TV licence', day: 25, pence: 1450 },
  { name: 'Car insurance', day: 28, pence: 4200 },
];
const pounds = (p: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(p / 100);
const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

function PaydaySum() {
  const [payday, setPayday] = useState(25);
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(SAMPLE.map((b) => [b.name, true])));
  const counted = useMemo(() => SAMPLE.filter((b) => on[b.name] && b.day <= payday), [on, payday]);
  const total = counted.reduce((n, b) => n + b.pence, 0);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
      <div className="flex flex-col gap-6 min-w-0" data-reveal style={{ ['--i' as string]: 2 }}>
        <label className="flex flex-wrap items-center gap-3 text-[20px] font-medium">
          I get paid on the
          <select value={payday} onChange={(e) => setPayday(Number(e.target.value))} className="min-h-[52px] rounded-full bg-[var(--ground)] px-5 text-[20px] font-semibold cursor-pointer">
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{ord(d)}</option>)}
          </select>
          of the month
        </label>
        <fieldset className="flex flex-col min-w-0">
          <legend className="text-[16px] mb-3">Tick the bills you have:</legend>
          {SAMPLE.map((b) => {
            const counts = on[b.name] && b.day <= payday;
            return (
              <label key={b.name} className="flex items-center gap-3 sm:gap-4 py-3.5 cursor-pointer group">
                <input type="checkbox" checked={on[b.name]} onChange={() => setOn({ ...on, [b.name]: !on[b.name] })} className="w-6 h-6 accent-[var(--ink)] shrink-0" />
                <span className="flex-1 min-w-0 text-[17px] sm:text-[18px] font-medium">{b.name}</span>
                <span className="text-[15px] sm:text-[16px] text-[var(--soft-ink)] w-[72px] sm:w-[120px] shrink-0 whitespace-nowrap"><span className="hidden sm:inline">due the </span>{ord(b.day)}</span>
                <span className={`tnum text-[17px] sm:text-[18px] w-[84px] sm:w-24 shrink-0 text-right transition-opacity duration-300 ${counts ? 'opacity-100' : 'opacity-40'}`}>{pounds(b.pence)}</span>
              </label>
            );
          })}
        </fieldset>
      </div>
      <div className="lg:sticky lg:top-40 rounded-[32px] bg-[var(--ink)] text-[var(--ground)] p-8 md:p-10 flex flex-col gap-4" data-reveal style={{ ['--i' as string]: 3 }}>
        <p className="text-[18px] text-[var(--on-deep)]">Keep aside before the {ord(payday)}</p>
        <p className="display tnum text-[60px] sm:text-[72px] md:text-[96px] text-[var(--highlight)]" aria-live="polite">{pounds(total)}</p>
        <p className="text-[16px] leading-relaxed text-[var(--on-deep)]">
          {counted.length ? `${counted.map((b) => b.name).join(', ')}.` : 'No ticked bills fall before payday.'} Bills due after payday wait for next month's pay.
        </p>
        <p className="text-[14px] text-[#b9cbbf]">Sample amounts. In the app you enter your own, and the sum updates as you mark bills paid.</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  useReveal();
  return (
    <Layout>
      {/* First screen: what it is, what it costs, where to get it, and the app itself. */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 grid lg:grid-cols-[1.25fr_1fr] gap-12 lg:gap-6 items-center pt-10 lg:pt-14 pb-0 lg:pb-14">
          <div className="flex flex-col gap-8 lg:pr-6">
            <h1 className="display text-[64px] sm:text-[96px] xl:text-[136px]">
              <span className="line"><span style={{ ['--i' as string]: 0 }}>Your day,</span></span>
              <span className="line"><span style={{ ['--i' as string]: 1 }}>in order.</span></span>
            </h1>
            <p className="fade-in text-[20px] md:text-[23px] leading-[1.45] max-w-[34ch]" style={{ ['--i' as string]: 1 }}>
              One calm app for your bills, medicine reminders and appointments. It shows what is due, and how much to keep aside before payday.
            </p>
            <div className="fade-in flex flex-col gap-4" style={{ ['--i' as string]: 2 }}>
              <StoreButtons />
              <p className="text-[16px] text-[var(--soft-ink)]">1 month free, then £3.99 a month or £35.99 a year.</p>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-y-0 -left-5 -right-5 lg:inset-y-[-80px] lg:left-[12%] lg:right-[-40vw] bg-[var(--field)] lg:rounded-l-[64px]" />
            <div className="relative fade-in py-10 lg:py-12 lg:mr-16" style={{ ['--i' as string]: 2 }}>
              <div className="drift lg:scale-110 lg:origin-center"><Phone><TodayScreen /></Phone></div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[var(--ink)] text-[var(--on-deep)] overflow-hidden py-5" aria-hidden="true">
        <div className="marquee gap-10 text-[22px] font-medium whitespace-nowrap">
          {[...STRIP, ...STRIP].map((s, i) => <span key={i} className="flex items-center gap-10">{s}<span className="w-2 h-2 rounded-full bg-[var(--highlight)]" /></span>)}
        </div>
      </div>

      {/* The problem, with a real picture of it. */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-40 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="photo rounded-[32px] aspect-[4/5]" data-reveal="scale">
          <img src="/img/overwhelm.jpg" alt="A person with their face covered in sticky notes" loading="lazy" />
        </div>
        <div className="flex flex-col gap-7">
          <h2 className="display text-[48px] md:text-[76px]" data-reveal>Life admin, all over the place.</h2>
          <p className="text-[20px] leading-[1.55] max-w-[46ch]" data-reveal style={{ ['--i' as string]: 1 }}>
            The council tax letter is on the side. Mum's tablets are in a box by the kettle. The dentist is on the fridge, and payday is still ten days away.
          </p>
          <p className="text-[20px] leading-[1.55] max-w-[46ch]" data-reveal style={{ ['--i' as string]: 2 }}>
            DayStead puts all of it in one list on your phone, in the order it is due, and reminds you before anything slips.
          </p>
        </div>
      </section>

      {/* The live thing: the app's core sum, done on the page. */}
      <section id="payday" className="bg-[var(--field)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 flex flex-col gap-12">
          <div className="flex flex-col gap-5 max-w-3xl">
            <h2 className="display text-[48px] md:text-[76px]" data-reveal>What to keep aside before payday</h2>
            <p className="text-[20px] leading-[1.55]" data-reveal style={{ ['--i' as string]: 1 }}>Pick your payday and tick the bills you have. DayStead does this sum for you every day, so the money is there when each bill goes out.</p>
          </div>
          <PaydaySum />
        </div>
      </section>

      {/* Bills: dark field, list beside the app. */}
      <section className="bg-[var(--field-deep)] text-[var(--ground)] overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-40 grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          <div className="flex flex-col gap-8">
            <h2 className="display text-[48px] md:text-[76px] text-white" data-reveal>Every bill, before it is due.</h2>
            <ul className="flex flex-col text-[19px] leading-[1.5]">
              {[
                ['Add UK bills in one tap', 'Council tax, energy, water, broadband, TV licence and more. You add the amount and the date.'],
                ['A reminder 3 days before', 'Time to move money across, not a surprise on the day.'],
                ['See where the month goes', 'A breakdown by category, and this month against last month.'],
                ['Missed ones turn red', 'If a bill is still not marked paid, it stays at the top and you get one more reminder the next morning.'],
              ].map(([t, d], i) => (
                <li key={t} className="py-5 flex flex-col gap-1" data-reveal style={{ ['--i' as string]: i + 1 }}>
                  <span className="text-white font-semibold text-[21px]">{t}</span>
                  <span className="text-[var(--on-deep)]">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex justify-center" data-reveal style={{ ['--i' as string]: 2 }}>
            <div className="photo absolute left-[18%] right-[-30vw] lg:right-[-25%] top-0 bottom-0 rounded-l-[32px]"><img src="/img/bills.jpg" alt="Household bills, a calculator and a phone on the floor" loading="lazy" /></div>
            <div className="relative py-12 lg:-ml-[30%]"><Phone><BillsScreen /></Phone></div>
          </div>
        </div>
      </section>

      {/* Medicines: picture first, then the words and the app. */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-40 flex flex-col gap-14">
        <div className="photo rounded-[32px] h-[300px] md:h-[520px]" data-reveal="scale">
          <img src="/img/medicines.jpg" alt="Blister packs of tablets on a blue surface" loading="lazy" />
        </div>
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
          <div className="flex flex-col gap-7">
            <h2 className="display text-[48px] md:text-[76px]" data-reveal>Reminders at the dose time.</h2>
            <p className="text-[20px] leading-[1.55] max-w-[48ch]" data-reveal style={{ ['--i' as string]: 1 }}>
              Set the times you were prescribed. You get a gentle reminder before each dose, or an alarm-style one on Android that rings even when the phone is locked.
            </p>
            <p className="text-[20px] leading-[1.55] max-w-[48ch]" data-reveal style={{ ['--i' as string]: 2 }}>
              Mark a dose taken, skip it, or snooze it for five minutes without moving the rest of the day. A dose left unmarked turns red after half an hour.
            </p>
            <p className="text-[16px] text-[var(--soft-ink)] max-w-[52ch]" data-reveal style={{ ['--i' as string]: 3 }}>
              DayStead records what you enter. It does not give medical advice or suggest doses.
            </p>
          </div>
          <div className="flex justify-center lg:-mt-48" data-reveal style={{ ['--i' as string]: 2 }}><Phone><MedicinesScreen /></Phone></div>
        </div>
      </section>

      {/* Appointments: wide picture band with the words over a field. */}
      <section className="bg-[var(--field)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 grid md:grid-cols-[1fr_1.15fr] gap-12 md:gap-20 items-center">
          <div className="flex flex-col gap-7 order-2 md:order-1">
            <h2 className="display text-[48px] md:text-[76px]" data-reveal>The week ahead, in one list.</h2>
            <p className="text-[20px] leading-[1.55] max-w-[44ch]" data-reveal style={{ ['--i' as string]: 1 }}>
              GP visits, the dentist, school forms, the MOT. Appointments and to-dos sit with your bills and medicines, so Monday morning starts with one look, not five.
            </p>
            <p className="text-[20px] leading-[1.55] max-w-[44ch]" data-reveal style={{ ['--i' as string]: 2 }}>
              Repeat anything daily, weekly or monthly, with an end date when it stops.
            </p>
          </div>
          <div className="photo rounded-[32px] aspect-[4/3] order-1 md:order-2" data-reveal="scale">
            <img src="/img/planner.jpg" alt="A monthly planner open beside a cup of coffee" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Carers. */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-40 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-end">
        <div className="flex flex-col gap-7">
          <h2 className="display text-[48px] md:text-[76px]" data-reveal>Looking after someone else too?</h2>
          <p className="text-[20px] leading-[1.55] max-w-[46ch]" data-reveal style={{ ['--i' as string]: 1 }}>
            Add bills, medicines and appointments for Mum, Dad, a partner or a child alongside your own. Every item says who it is for, so nothing gets mixed up.
          </p>
        </div>
        <div className="flex flex-wrap gap-3" data-reveal style={{ ['--i' as string]: 2 }}>
          {['Me', 'Mum', 'Dad', 'Partner', 'Grandad', 'Sophie'].map((w, i) => (
            <span key={w} className={`rounded-full px-6 py-3 text-[20px] font-medium ${i === 1 ? 'bg-[var(--ink)] text-white' : 'bg-[var(--field)]'}`}>{w}</span>
          ))}
        </div>
      </section>

      {/* Privacy. */}
      <section className="bg-[var(--field-deep)] text-[var(--ground)]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-36 grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
          <div className="flex justify-center" data-reveal><LockScreen /></div>
          <div className="flex flex-col gap-8">
            <h2 className="display text-[48px] md:text-[76px] text-white" data-reveal>Private on your lock screen.</h2>
            <ul className="flex flex-col gap-6 text-[19px] leading-[1.5] text-[var(--on-deep)]">
              <li data-reveal style={{ ['--i' as string]: 1 }}><span className="block text-white font-semibold text-[21px]">Reminders never say what they are for</span>They only say "DayStead reminder", so someone glancing at your phone sees nothing private.</li>
              <li data-reveal style={{ ['--i' as string]: 2 }}><span className="block text-white font-semibold text-[21px]">Your records stay yours</span>Export everything or delete your account from the app at any time.</li>
              <li data-reveal style={{ ['--i' as string]: 3 }}><span className="block text-white font-semibold text-[21px]">We never see your card</span>Payments go through Google Play, or the App Store on iPhone.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Price. */}
      <section className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-40 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div className="flex flex-col gap-7">
          <h2 className="display text-[48px] md:text-[76px]" data-reveal>1 month free. Then £3.99.</h2>
          <p className="text-[20px] leading-[1.55] max-w-[44ch]" data-reveal style={{ ['--i' as string]: 1 }}>
            Everything is included. Start your free month in the app, and we remind you 3 days before it ends. Cancel before then and you pay nothing.
          </p>
          <Link to="/pricing" className="btn btn-ink self-start" data-reveal style={{ ['--i' as string]: 2 }}>See how pricing works</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4" data-reveal style={{ ['--i' as string]: 2 }}>
          <div className="rounded-[28px] bg-[var(--field)] p-7 flex flex-col gap-1">
            <p className="text-[17px]">Monthly</p>
            <p className="display tnum text-[56px] md:text-[72px]">£3.99</p>
            <p className="text-[16px] text-[var(--soft-ink)]">a month</p>
          </div>
          <div className="rounded-[28px] bg-[var(--ink)] text-[var(--ground)] p-7 flex flex-col gap-1">
            <p className="text-[17px]">Yearly, <span className="text-[var(--highlight)] font-semibold">save 25%</span></p>
            <p className="display tnum text-[56px] md:text-[72px]">£35.99</p>
            <p className="text-[16px] text-[var(--on-deep)]">a year, about £3 a month</p>
          </div>
        </div>
      </section>

      {/* Get the app. */}
      <section id="get" className="bg-[var(--accent)] text-white scroll-mt-28">
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-24 md:py-32 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div className="flex flex-col gap-6">
            <h2 className="display text-[56px] md:text-[96px]" data-reveal>Get DayStead.</h2>
            <p className="text-[20px] leading-[1.55] max-w-[42ch]" data-reveal style={{ ['--i' as string]: 1 }}>Launching first on Android, with iPhone to follow. Your first month is free.</p>
          </div>
          <div data-reveal style={{ ['--i' as string]: 2 }}><StoreButtons tone="light" /></div>
        </div>
      </section>
    </Layout>
  );
}
