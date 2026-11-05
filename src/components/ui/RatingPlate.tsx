import type { ReactNode } from "react";

/** The four rivets of an aluminium nameplate. */
export function Rivets() {
  return (
    <>
      <span aria-hidden className="rivet left-2 top-2" />
      <span aria-hidden className="rivet right-2 top-2" />
      <span aria-hidden className="rivet bottom-2 left-2" />
      <span aria-hidden className="rivet bottom-2 right-2" />
    </>
  );
}

type Row = { label: ReactNode; value: ReactNode };

/** An etched rating plate: label and value rows, like the nameplate riveted to a piece of equipment. */
export function RatingPlate({
  rows,
  label,
  title,
  className = "",
}: {
  rows: Row[];
  label: string;
  title?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rating-plate px-6 py-5 ${className}`}>
      <Rivets />
      {title && <p className="mb-2 text-small font-bold font-stretch-expanded">{title}</p>}
      <dl aria-label={label}>
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-6 border-b border-[#a8aeb2] py-2 last:border-b-0"
          >
            {/* The label never wraps or shrinks; a long value wraps instead. */}
            <dt className="shrink-0 whitespace-nowrap text-small text-ink-2">{row.label}</dt>
            <dd className="text-right font-bold font-stretch-[85%] text-pretty tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
