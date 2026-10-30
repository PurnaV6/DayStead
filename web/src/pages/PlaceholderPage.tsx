export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="text-[var(--ds-muted)] mt-3">
        This section of the prototype isn't built yet. The Overview dashboard is the focus of
        this preview.
      </p>
    </div>
  );
}
