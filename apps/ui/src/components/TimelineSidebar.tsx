import { Link } from "react-router-dom";
import type { DemoTimelineNode } from "../demoData";
import { MiniCalendar, type CalendarEntry } from "./MiniCalendar";

type Props = {
  items: DemoTimelineNode[];
  activeKind: "snapshot" | "diff";
  activeId: string;
  calendarEntries: CalendarEntry[];
  selectedDate: string;
};

export function TimelineSidebar({ items, activeKind, activeId, calendarEntries, selectedDate }: Props) {
  return (
    <aside className="space-y-3 rounded-2xl border border-line bg-white p-3 shadow-panel">
      <div className="border-b border-line px-3 pb-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Timeline</div>
        <div className="mt-2 text-sm text-slate-600">Select a point in time or open a diff.</div>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const selected =
            (item.kind === "snapshot" && activeKind === "snapshot" && item.revisionId === activeId) ||
            (item.kind === "diff" && activeKind === "diff" && item.diffId === activeId);

          const href = item.kind === "diff" ? `/diffs/${item.diffId}` : `/devices/1?revision=${item.revisionId}`;

          return (
            <Link
              key={item.id}
              className={`block rounded-[1.4rem] border px-4 py-3 transition ${
                selected
                  ? "border-accent/30 bg-blue-50"
                  : "border-line bg-slate-50 hover:bg-white"
              }`}
              to={href}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] ${
                    item.kind === "diff" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {item.kind}
                </span>
                <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="mt-3 text-sm font-medium text-ink">{item.title}</div>
              <div className="mt-1 text-xs text-slate-500">{item.actor}</div>
              <div className="mt-2 text-xs leading-5 text-slate-600">{item.note}</div>
            </Link>
          );
        })}
      </div>
      <MiniCalendar entries={calendarEntries} monthLabel="March 2026" selectedDate={selectedDate} />
    </aside>
  );
}
