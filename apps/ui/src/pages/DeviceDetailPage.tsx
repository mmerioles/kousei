import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ConfigViewer } from "../components/ConfigViewer";
import { TimelineSidebar } from "../components/TimelineSidebar";
import { demoDevice } from "../demoData";
import { useDemoData } from "../demoDataStore";
import { buildSnapshotFilename, downloadTextFile } from "../download";

export function DeviceDetailPage() {
  const [searchParams] = useSearchParams();
  const { diffs, revisions, timeline, getRevisionById, updateRevision } = useDemoData();
  const activeRevisionId = searchParams.get("revision") ?? revisions[2].id;
  const revision = useMemo(() => getRevisionById(activeRevisionId), [activeRevisionId, getRevisionById]);
  const calendarEntries = useMemo(
    () => [
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
    ],
    [diffs, revisions],
  );

  function downloadSnapshot() {
    downloadTextFile(buildSnapshotFilename(demoDevice.hostname, revision.label, revision.timestamp), revision.config);
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Config history</div>
            <div className="mt-2">
              <div>
                <h2 className="text-3xl font-semibold">{demoDevice.hostname}</h2>
                <div className="mt-1 text-sm text-slate-600">{new Date(revision.timestamp).toLocaleString()} by {revision.actor}</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block">
                <div className="flex items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  <span>Change label</span>
                  <span className="text-[10px] tracking-[0.12em] text-slate-400">Autosaves locally</span>
                </div>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-4 py-2 text-sm text-ink outline-none"
                  onChange={(event) =>
                    updateRevision(revision.id, {
                      label: event.target.value,
                      note: revision.note,
                    })
                  }
                  value={revision.label}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <TimelineSidebar
          activeId={revision.id}
          activeKind="snapshot"
          calendarEntries={calendarEntries}
          items={timeline}
          selectedDate={revision.timestamp.slice(0, 10)}
        />
        <ConfigViewer content={revision.config} onDownload={downloadSnapshot} sha256={revision.sha256} />
      </div>
    </div>
  );
}
