"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/contacts", label: "Contacts" },
  { href: "/pipeline", label: "Pipeline" },
] as const;

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Main" className="order-3 -mb-px flex w-full gap-6 sm:order-2 sm:w-auto">
      {NAV_ITEMS.map((item) => {
        const isCurrent = pathname !== null && pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "border-b-2 py-3 text-sm font-medium transition-colors sm:py-5",
              isCurrent
                ? "border-brand text-ink"
                : "border-transparent text-ink-soft hover:border-rule-strong hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavLinks() {
  return <NavList pathname={usePathname()} />;
}

export function NavLinksFallback() {
  return <NavList pathname={null} />;
}
