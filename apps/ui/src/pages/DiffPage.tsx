import { useParams } from "react-router-dom";
import { InlineDiffViewer } from "../components/InlineDiffViewer";
import { TimelineSidebar } from "../components/TimelineSidebar";
import { useDemoData } from "../demoDataStore";

export function DiffPage() {
  const { diffs, revisions, timeline, getDiffById, getRevisionById, updateDiff } = useDemoData();
  const { diffId = "diff-1" } = useParams();
  const diff = getDiffById(diffId);
  const toRevision = getRevisionById(diff.toRevisionId);
  const calendarEntries = [
    ...revisions.map((item) => ({
      date: item.timestamp.slice(0, 10),
      href: `/devices/1?revision=${item.id}`,
      kind: "snapshot" as const,
      label: item.label,
    })),
    ...diffs.map((item) => ({
      date: item.timestamp.slice(0, 10),
      href: `/diffs/${item.id}`,
      kind: "diff" as const,
      label: item.title,
    })),
  ];

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
        <div className="px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Diff review</div>
            <div className="mt-2 text-3xl font-semibold">{diff.title}</div>
            <div className="mt-1 text-sm text-slate-600">{new Date(diff.timestamp).toLocaleString()} by {diff.actor}</div>
            <div className="mt-4">
              <label className="block">
                <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  <span>Change label</span>
                  <span className="text-[10px] tracking-[0.12em] text-slate-400">Autosaves locally</span>
                </div>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-4 py-2 text-sm text-ink outline-none"
                  onChange={(event) =>
                    updateDiff(diff.id, {
                      title: event.target.value,
                      summary: diff.summary,
                    })
                  }
                  value={diff.title}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <TimelineSidebar
          activeId={diff.id}
          activeKind="diff"
          calendarEntries={calendarEntries}
          items={timeline}
          selectedDate={diff.timestamp.slice(0, 10)}
        />
        <InlineDiffViewer diff={diff} sha256={toRevision.sha256} />
      </div>
    </div>
  );
}
