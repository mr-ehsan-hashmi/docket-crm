import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "./icons";
import { NavLinks, NavLinksFallback } from "./nav-links";
import { buttonStyles } from "./ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-rule bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 pt-3 sm:flex-nowrap sm:px-6 sm:pt-0">
        <Link href="/contacts" className="flex items-baseline gap-2 rounded-sm">
          <span className="font-serif text-2xl font-semibold tracking-tight text-brand">Docket</span>
          <span className="hidden text-xs uppercase tracking-[0.14em] text-ink-faint md:inline">
            Hale &amp; Mendes · Intake desk
          </span>
        </Link>

        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>

        <Link
          href="/contacts/new"
          className={buttonStyles({ variant: "primary", size: "sm", className: "order-2 ml-auto sm:order-3" })}
        >
          <PlusIcon />
          New contact
        </Link>
      </div>
    </header>
  );
}
