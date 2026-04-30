export default function PlaceholderBlock({ label, lines, note, className = "" }) {
  return (
    <div
      className={[
        "max-w-full overflow-hidden rounded-2xl bg-white/[0.04] p-4",
        className,
      ].join(" ")}
    >
      {label ? (
        <div className="overflow-auto text-xs uppercase tracking-[0.28em] text-neutral-500">
          {label}
        </div>
      ) : null}
      <div className="mt-3 max-w-full space-y-2 overflow-auto font-mono text-sm text-neutral-300">
        {lines.map((line) => (
          <div
            key={line}
            className="max-w-full overflow-auto rounded-xl bg-black/20 px-3 py-2 whitespace-nowrap"
          >
            {line}
          </div>
        ))}
      </div>
      {note ? <p className="mt-3 overflow-auto break-words text-sm text-neutral-400">{note}</p> : null}
    </div>
  );
}
