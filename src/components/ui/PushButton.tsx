import type { ReactNode } from "react";

/** A big red mushroom push button. Depresses when pressed. */
export function PushButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group inline-flex items-center gap-4">
      <span
        aria-hidden
        className="grid size-20 place-items-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#3a3d40,#1c1d1f)] shadow-[0_8px_18px_-8px_rgb(0_0_0/0.6)]"
      >
        <span className="size-14 rounded-full bg-[radial-gradient(circle_at_40%_30%,var(--color-red-hot),var(--color-red)_60%,#8d140e)] shadow-[0_5px_0_#6e0f0a,inset_0_2px_3px_rgb(255_255_255/0.35)] transition-[translate,box-shadow] duration-100 group-hover:shadow-[0_4px_0_#6e0f0a,inset_0_2px_3px_rgb(255_255_255/0.35)] group-active:translate-y-1 group-active:shadow-[0_1px_0_#6e0f0a,inset_0_2px_3px_rgb(255_255_255/0.2)]" />
      </span>
      <span className="tape text-body" style={{ ["--tilt" as string]: "-1.5deg" }}>
        {children}
      </span>
    </a>
  );
}
