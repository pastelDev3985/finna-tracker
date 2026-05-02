"use client";

import { Calendar, FileText, Scale } from "lucide-react";
import Link from "next/link";
import { ExpandableSection } from "@/components/shared/expandable-section";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance",
    body: (
      <>
        <p>
          By accessing or using Finora (&quot;the Service&quot;), you agree to
          these terms. If you do not agree, do not use the Service. We may update
          these terms; continued use after changes constitutes acceptance.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "The service",
    body: (
      <>
        <p>
          Finora provides personal finance tools for organising your own data.
          Features may change or be interrupted. The Service is not a bank,
          broker, or tax adviser. Nothing in the app is personalised investment,
          tax, or legal advice.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "Your account & data",
    body: (
      <>
        <p>
          You are responsible for account security and for the accuracy of
          information you enter. You may delete your account where the product
          allows; some data may be retained where required by law. Use the
          Service only in compliance with applicable laws.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "AI-assisted features",
    body: (
      <>
        <p>
          AI-generated content may be incorrect or incomplete. Do not rely on
          it as the sole basis for financial decisions. Outputs are based on
          data you store in the Service and general prompts, within product
          limits.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Disclaimer & limitation",
    body: (
      <>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any
          kind, to the fullest extent permitted by law. To the extent permitted,
          we are not liable for indirect or consequential losses arising from
          use of the Service.
        </p>
      </>
    ),
  },
] as const;

export function TermsPageContent() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="glass relative overflow-hidden rounded-2xl border border-border/80 p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent opacity-90" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
              <Scale className="size-6 text-primary" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold text-foreground sm:text-lg">
                Legal agreement
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                This is a general template — replace with counsel-approved text
                for production. Nothing here creates a lawyer–client
                relationship.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground/90">
            <Calendar className="size-4 shrink-0 text-primary" aria-hidden />
            <span>
              Last updated: <strong className="text-foreground">2 May 2026</strong>
            </span>
          </div>
        </div>
      </div>

      <nav
        aria-label="Terms sections"
        className="glass flex flex-wrap gap-2 rounded-2xl p-3"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#term-${s.id}`}
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-150 hover:border-primary/40 hover:bg-primary/10 active:scale-[0.97] active:bg-primary/15"
          >
            <FileText className="size-3.5 shrink-0 text-primary" aria-hidden />
            {s.title}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((section, index) => (
          <div key={section.id} id={`term-${section.id}`} className="scroll-mt-24">
            <ExpandableSection
              title={section.title}
              defaultOpen={index === 0}
            >
              {section.body}
            </ExpandableSection>
          </div>
        ))}
      </div>

      <div className="glass flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 p-5 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-foreground">How to use Finora</p>
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:bg-primary-active active:scale-[0.97]"
        >
          Open user guide
        </Link>
      </div>
    </div>
  );
}
