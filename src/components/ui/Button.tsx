import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "sm";

type Common = {
  variant?: Variant;
  size?: Size;
  /** Use inside a board enclosure. */
  tone?: "steel" | "panel";
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const base =
  "inline-flex items-center justify-center gap-2 rounded-[4px] font-bold transition-[translate,box-shadow,background-color] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40";

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-body",
  sm: "min-h-8 px-3 text-small",
};

function variantClass(variant: Variant, tone: "steel" | "panel") {
  if (variant === "primary") {
    return "bg-red text-white shadow-[0_3px_0_#7a140e] hover:bg-[oklch(0.6_0.22_29)] active:shadow-[0_1px_0_#7a140e]";
  }
  if (variant === "quiet") {
    return tone === "panel"
      ? "min-h-0! px-0! text-panel-fg underline decoration-panel-dim underline-offset-4 hover:decoration-panel-fg active:translate-y-0!"
      : "min-h-0! px-0! text-ink underline decoration-ink-3 underline-offset-4 hover:decoration-ink active:translate-y-0!";
  }
  // Secondary: a moulded switch-plate key
  return tone === "panel"
    ? "bg-panel-2 text-panel-fg shadow-[inset_0_0_0_1px_var(--color-panel-line),0_2px_0_#000] hover:bg-panel-line"
    : "bg-[linear-gradient(var(--color-breaker),var(--color-breaker-shade))] text-ink shadow-[inset_0_0_0_1px_#9aa0a5,0_3px_0_#8b9095] active:shadow-[inset_0_0_0_1px_#9aa0a5,0_1px_0_#8b9095]";
}

/** The site's button family. Renders an anchor when given `href`. Presses down like a physical key. */
export function Button(props: AsLink | AsButton) {
  const { variant = "secondary", size = "md", tone = "steel", className = "", children, ...rest } = props;
  const classes = `${base} ${sizes[size]} ${variantClass(variant, tone)} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={classes}>
      {children}
    </button>
  );
}
