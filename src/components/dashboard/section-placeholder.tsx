import type { ReactNode } from "react";

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
  children,
}: SectionPlaceholderProps) {
  return (
    <section className="panel ambient-ring p-8 md:p-10 animate-fade-in">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <div className="max-w-2xl">
        <h1 className="display text-4xl text-ink md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted md:text-lg">
          {description}
        </p>
      </div>
      {children ? <div className="mt-8 animate-slide-up">{children}</div> : null}
    </section>
  );
}
