import type { ReactNode } from "react";

/** The four corner screws of a board enclosure. */
export function Screws({ inset = 10 }: { inset?: number }) {
  const at = `${inset}px`;
  return (
    <>
      <span aria-hidden className="screw" style={{ top: at, left: at }} />
      <span aria-hidden className="screw" style={{ top: at, right: at }} />
      <span aria-hidden className="screw" style={{ bottom: at, left: at }} />
      <span aria-hidden className="screw" style={{ bottom: at, right: at }} />
    </>
  );
}

type EnclosureProps = {
  /** Small label at the top-left of the board, on a strip of tape. */
  label?: ReactNode;
  labelId?: string;
  className?: string;
  children: ReactNode;
};

/** A dark board enclosure with screws. Used where something is live: the board, the case study, the palette, the chat. */
export function Enclosure({ label, labelId, className = "", children }: EnclosureProps) {
  return (
    <div className={`enclosure ${className}`}>
      <Screws />
      {label && (
        <p id={labelId} className="tape mx-7 mt-5 text-data" style={{ ["--tilt" as string]: "-1deg" }}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
