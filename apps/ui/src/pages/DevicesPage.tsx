import { Link } from "react-router-dom";
import { Panel } from "../components/Panel";
import { demoDevice } from "../demoData";
import { useDemoData } from "../demoDataStore";

export function DevicesPage() {
  const { diffs, revisions } = useDemoData();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Inventory</div>
            <h2 className="mt-2 text-xl font-semibold">Demo inventory</h2>
          </div>
          <div className="rounded-full border border-line bg-slate-50 px-3 py-1 text-sm text-slate-500">1 device</div>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line bg-slate-50 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <div>Device</div>
            <div>History access</div>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-2xl font-semibold">{demoDevice.hostname}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {demoDevice.mgmtIp} | {demoDevice.vendor} {demoDevice.platform} | {demoDevice.location}
                </div>
              </div>
              <Link
                className="inline-flex rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                to={`/devices/${demoDevice.id}`}
              >
                Open config history
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-line bg-slate-50 p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Revisions</div>
                <div className="mt-2 text-3xl font-semibold">{revisions.length}</div>
              </div>
              <div className="rounded-xl border border-line bg-slate-50 p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Diff points</div>
                <div className="mt-2 text-3xl font-semibold">{diffs.length}</div>
              </div>
              <div className="rounded-xl border border-line bg-slate-50 p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Last actor</div>
                <div className="mt-2 text-xl font-semibold">{revisions[2].actor}</div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Product notes</div>
        <h2 className="mt-2 text-xl font-semibold">What this demo emphasizes</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div className="rounded-xl border border-line bg-slate-50 p-4">
            Timeline-first navigation instead of dashboard widgets.
          </div>
          <div className="rounded-xl border border-line bg-slate-50 p-4">
            Full config visibility with each revision treated like a commit view.
          </div>
          <div className="rounded-xl border border-line bg-slate-50 p-4">
            Inline red/green diffs that read like Git, not split panes.
          </div>
        </div>
      </Panel>
    </div>
  );
}
