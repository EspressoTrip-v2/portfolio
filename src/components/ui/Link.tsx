import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "@/components/Icons";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
  href: string;
  /** Opens in a new tab and shows the external-link icon. */
  external?: boolean;
  tone?: "steel" | "panel";
  className?: string;
  children: ReactNode;
};

/** Inline text link. The underline turns breaker-red on hover; the arrow appears only on links that leave the site. */
export function Link({ href, external = false, tone = "steel", className = "", children, ...rest }: LinkProps) {
  const colours =
    tone === "panel"
      ? "text-panel-fg decoration-panel-dim hover:decoration-red-hot"
      : "text-ink decoration-ink-3 hover:decoration-red";
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...rest}
      className={`inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-4 transition-colors ${colours} ${className}`}
    >
      {children}
      {external && (
        <>
          <ArrowUpRight className="size-3.5 shrink-0" />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
