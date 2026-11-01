import type { CSSProperties, ElementType, ReactNode } from "react";

type TapeProps = {
  as?: ElementType;
  /** Rotation in degrees; hand-applied labels are never quite straight. */
  tilt?: number;
  /** Slap the label on when it first renders, after `delay` seconds. */
  slap?: boolean;
  delay?: number;
  id?: string;
  className?: string;
  children: ReactNode;
};

/** Embossed label-maker tape. Text is written in normal case; the tape prints it in capitals. */
export function Tape({ as: Tag = "span", tilt = 0, slap = false, delay = 0, id, className = "", children }: TapeProps) {
  const style = { "--tilt": `${tilt}deg`, "--delay": `${delay}s` } as CSSProperties;
  return (
    <Tag id={id} style={style} className={`tape ${slap ? "slap" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
