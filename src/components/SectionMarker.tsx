interface Props {
  num: number;
  label?: string;
}

export function SectionMarker({ num, label }: Props) {
  return (
    <div
      className="pointer-events-none absolute left-3 top-3 z-[60] inline-flex items-center gap-1.5 rounded-full bg-[#ff6c0e] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg sm:left-5 sm:top-5 sm:text-xs"
      aria-hidden="true"
    >
      <span className="tabular-nums">§{num}</span>
      {label ? <span className="opacity-90">· {label}</span> : null}
    </div>
  );
}
