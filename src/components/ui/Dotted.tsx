import { Fragment } from "react";

/**
 * A "·"-separated list that only wraps between items, never inside one, so a short item like
 * "12+ yrs" can't end up alone on a line. The space after each separator sits outside the
 * no-wrap span, so the line can break there.
 */
export function Dotted({ items }: { items: string[] }) {
  return items.map((item, i) => (
    <Fragment key={item}>
      <span className="whitespace-nowrap">
        {item}
        {i < items.length - 1 && " ·"}
      </span>{" "}
    </Fragment>
  ));
}
