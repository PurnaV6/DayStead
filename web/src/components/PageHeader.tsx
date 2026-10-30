import type { ReactNode } from 'react';
import { AddButton, type AddKind } from './AddDialog';

export default function PageHeader({
  eyebrow,
  title,
  sub,
  addKind,
  addLabel,
}: {
  eyebrow: string;
  title: ReactNode;
  sub: string;
  addKind?: AddKind;
  addLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs tracking-widest uppercase text-[var(--ds-muted)]">{eyebrow}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-3">{title}</h1>
        <p className="text-[var(--ds-muted)] mt-2">{sub}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden lg:flex items-center gap-2 text-xs border border-[var(--ds-line)] rounded-full px-3 py-1.5 text-[var(--ds-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--ds-ink)]" /> Saved in this browser only
        </span>
        <AddButton kind={addKind} label={addLabel} />
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-8 border border-dashed border-[var(--ds-accent-line)] rounded-2xl p-10 text-center text-[var(--ds-muted)] bg-white">
      {text}
    </div>
  );
}
