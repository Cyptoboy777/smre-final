import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, children, className }: PanelProps) {
  return (
    <section
      className={[
        "rounded-[24px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm",
        className ?? "",
      ].join(" ")}
    >
      <header className="mb-4 space-y-1">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/65">{eyebrow}</p>
        ) : null}
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
      </header>
      {children}
    </section>
  );
}
