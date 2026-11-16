import { ReviewerTools } from "./reviewer-tools";

export function AppFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-ink-faint sm:px-6">
        <p>Demo data only. Everything you add is saved in this browser and nowhere else.</p>
        <ReviewerTools />
      </div>
    </footer>
  );
}
