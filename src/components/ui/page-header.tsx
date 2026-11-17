import type { ReactNode } from "react";
import { ArrowLeftIcon } from "../icons";
import { AppLink } from "../unsaved-changes";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  backLink?: { href: string; label: string };
  actions?: ReactNode;
}

export function PageHeader({ title, description, backLink, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {backLink ? (
        <AppLink
          href={backLink.href}
          className="-mt-2 mb-1 inline-flex min-h-10 items-center gap-1.5 rounded-sm text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeftIcon />
          {backLink.label}
        </AppLink>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="wrap-anywhere font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
