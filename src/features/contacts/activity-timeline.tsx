import type { ReactNode } from "react";
import { STATUS_DOT_CLASSES } from "@/components/ui/status-badge";
import { STATUS_LABELS } from "@/lib/contacts/labels";
import type { Activity } from "@/lib/contacts/types";
import { cn, formatDateTime } from "@/lib/format";

function joinFields(fields: string[]): string {
  if (fields.length <= 1) return fields[0] ?? "details";
  return `${fields.slice(0, -1).join(", ")} and ${fields[fields.length - 1]}`;
}

function describeActivity(activity: Activity): { summary: ReactNode; detail?: string } {
  switch (activity.type) {
    case "created":
      return { summary: "Added to contacts" };
    case "status_changed":
      return {
        summary: (
          <>
            Moved from <strong className="font-semibold">{STATUS_LABELS[activity.from]}</strong> to{" "}
            <strong className="font-semibold">{STATUS_LABELS[activity.to]}</strong>
          </>
        ),
      };
    case "details_updated":
      return { summary: `Updated ${joinFields(activity.fields)}` };
    case "note_added":
      return { summary: "Note added", detail: activity.excerpt };
  }
}

function markerClasses(activity: Activity): string {
  return activity.type === "status_changed" ? STATUS_DOT_CLASSES[activity.to] : "bg-rule-strong";
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="mb-3 font-serif text-xl font-medium">
        Activity
      </h2>

      {activities.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing has happened on this contact yet.</p>
      ) : (
        <ol className="relative ml-1.5 border-l border-rule-strong">
          {activities.map((activity) => {
            const { summary, detail } = describeActivity(activity);
            return (
              <li key={activity.id} className="relative pb-5 pl-6 last:pb-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -left-[5px] top-1.5 size-[9px] rounded-full ring-4 ring-paper",
                    markerClasses(activity),
                  )}
                />
                <p className="text-sm text-ink">{summary}</p>
                {detail ? <p className="mt-0.5 text-sm text-ink-soft">&ldquo;{detail}&rdquo;</p> : null}
                <p className="mt-0.5 text-xs text-ink-faint">
                  <time dateTime={activity.createdAt}>{formatDateTime(activity.createdAt)}</time>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
