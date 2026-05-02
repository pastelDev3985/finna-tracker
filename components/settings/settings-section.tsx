import type { ReactNode } from "react";

interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsSection({
  id,
  title,
  description,
  children,
}: SettingsSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-6 space-y-4 sm:scroll-mt-8"
    >
      <div>
        <h2
          id={headingId}
          className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground/85">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
