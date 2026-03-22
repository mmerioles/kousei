import { Link } from "react-router-dom";

export type CalendarEntry = {
  date: string;
  href: string;
  kind: "snapshot" | "diff";
  label: string;
};

type Props = {
  monthLabel: string;
  entries: CalendarEntry[];
  selectedDate: string;
};

export function MiniCalendar({ monthLabel, entries, selectedDate }: Props) {
  const daysInMonth = 31;
  const startOffset = 0;
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => index - startOffset + 1);

  return (
    <section className="rounded-2xl border border-line bg-slate-50 p-3">
      <div className="px-3 pb-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Calendar</div>
        <div className="mt-2 text-sm text-slate-700">{monthLabel}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 px-1 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div className="py-2" key={day}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 p-1">
        {cells.map((day) => {
          if (day < 1) {
            return <div key={`empty-${day}`} />;
          }

          const date = `2026-03-${String(day).padStart(2, "0")}`;
          const dayEntries = entries.filter((entry) => entry.date === date);
          const latest = dayEntries[dayEntries.length - 1];
          const selected = selectedDate === date;
          const hasEvents = dayEntries.length > 0;
          const baseClass = `flex min-h-[56px] flex-col rounded-2xl border px-2 py-2 text-left transition ${
            selected
              ? "border-accent/30 bg-blue-50"
              : hasEvents
                ? "border-line bg-white hover:border-slate-300"
                : "border-transparent bg-transparent text-slate-600"
          }`;

          const content = (
            <>
              <span className={`text-xs ${hasEvents ? "text-ink" : "text-slate-500"}`}>{day}</span>
              {hasEvents ? (
                <span className="mt-auto flex items-center gap-1 pt-2">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        entry.kind === "diff" ? "bg-rose-300" : "bg-sky-300"
                      }`}
                      key={`${entry.kind}-${entry.label}`}
                    />
                  ))}
                </span>
              ) : null}
            </>
          );

          return latest ? (
            <Link aria-label={latest.label} className={baseClass} key={date} to={latest.href}>
              {content}
            </Link>
          ) : (
            <div className={baseClass} key={date}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
