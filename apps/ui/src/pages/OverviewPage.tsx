import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { useDemoData } from "../demoDataStore";

const statusStyles = {
  healthy: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border border-amber-200 bg-amber-50 text-amber-700",
  drift: "border border-rose-200 bg-rose-50 text-rose-700",
} as const;

export function OverviewPage() {
  const { diffs, fleetDevices, revisions, timeline } = useDemoData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "changed" | "attention">("all");
  const diffsLast24h = fleetDevices.reduce((total, device) => total + device.diffsLast24h, 0);
  const activeDevices = fleetDevices.filter((device) => device.diffsLast24h > 0).length;
  const driftedDevices = fleetDevices.filter((device) => device.status === "drift").length;
  const filteredDevices = useMemo(() => {
    return fleetDevices.filter((device) => {
      const matchesSearch =
        search.trim() === "" ||
        `${device.hostname} ${device.mgmtIp} ${device.site} ${device.platform}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "changed" && device.diffsLast24h > 0) ||
        (filter === "attention" && device.status !== "healthy");
      return matchesSearch && matchesFilter;
    });
  }, [filter, fleetDevices, search]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Devices" value={fleetDevices.length} />
        <StatCard label="Diffs 24h" value={diffsLast24h} />
        <StatCard label="Attention" value={driftedDevices} />
      </div>
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Fleet overview</p>
            <h2 className="mt-2 text-2xl font-semibold">Scan the estate, then drop into history</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This top-level view is meant for triage: which devices changed in the last 24 hours, which ones are
              drifting, and where to click when you need the full config history.
            </p>
          </div>
          <Link className="inline-flex rounded-lg border border-line bg-slate-900 px-5 py-3 text-sm font-medium text-white" to="/devices/1">
            Open latest history
          </Link>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex flex-col gap-3 border-b border-line bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <input
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400 md:max-w-sm"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search hostname, IP, site, platform"
                value={search}
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All devices" },
                  { id: "changed", label: "Changed 24h" },
                  { id: "attention", label: "Needs attention" },
                ].map((item) => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm ${
                      filter === item.id
                        ? "border border-slate-900 bg-slate-900 text-white"
                        : "border border-line bg-white text-slate-700"
                    }`}
                    key={item.id}
                    onClick={() => setFilter(item.id as typeof filter)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1.2fr)_150px_120px_180px] gap-3 border-b border-line bg-slate-50 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <div>Device</div>
              <div>Status</div>
              <div>Diffs 24h</div>
              <div>Last change</div>
            </div>
            <div>
              {filteredDevices.map((device) => (
                <Link
                  className="grid grid-cols-[minmax(0,1.2fr)_150px_120px_180px] gap-3 border-b border-line/80 px-5 py-4 transition hover:bg-slate-50"
                  key={device.id}
                  to={device.id === 1 ? "/devices/1" : "/devices"}
                >
                  <div>
                    <div className="text-base font-semibold text-ink">{device.hostname}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {device.platform} | {device.mgmtIp} | {device.site}
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-500">SHA-256 {device.latestSha256}</div>
                    <div className="mt-2 text-sm text-slate-700">{device.summary}</div>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[device.status]}`}>
                      {device.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-ink">{device.diffsLast24h}</div>
                  <div className="text-sm text-slate-600">{new Date(device.lastChange).toLocaleString()}</div>
                </Link>
              ))}
              {filteredDevices.length === 0 ? (
                <div className="px-5 py-8 text-sm text-slate-500">No devices match the current filters.</div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Recent changes</div>
                  <div className="mt-1 text-lg font-semibold text-ink">{activeDevices} devices changed in 24h</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {fleetDevices
                  .filter((device) => device.diffsLast24h > 0)
                  .map((device) => (
                    <div className="rounded-xl border border-line bg-slate-50 p-4" key={device.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-ink">{device.hostname}</div>
                        <div className="text-xs text-slate-500">{device.diffsLast24h} diffs</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{device.summary}</div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
              <div className="border-b border-line pb-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Latest timeline</div>
                <div className="mt-1 text-lg font-semibold text-ink">Recent snapshots and diffs</div>
              </div>
              <div className="mt-3 space-y-3">
                {timeline.slice(0, 3).map((item) => (
                  <div className="rounded-xl border border-line bg-slate-50 p-4" key={item.id}>
                    <div className="text-sm font-semibold text-ink">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</div>
                    <div className="mt-2 text-sm text-slate-700">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>
      <Panel>
        <h2 className="text-xl font-semibold">History browser preview</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-line bg-slate-50 p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Why it works</div>
            <div className="mt-3 text-lg font-semibold text-ink">Git-style triage for network config</div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              The operator starts from a fleet list, sees which devices changed recently, opens a specific device, and
              then pivots between a dated timeline, a calendar, and inline diffs without losing the config context.
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-panel">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Most recent diff</div>
            <div className="mt-2 text-lg font-semibold">{diffs[1].title}</div>
            <div className="mt-2 text-sm text-slate-700">{diffs[1].summary}</div>
            <div className="mt-3 text-sm text-slate-600">
              Revision window: {new Date(revisions[1].timestamp).toLocaleString()} to{" "}
              {new Date(revisions[2].timestamp).toLocaleString()}
            </div>
            <Link className="mt-4 inline-flex rounded-lg border border-line px-4 py-2 text-sm font-medium text-slate-700" to="/diffs/diff-2">
              Open latest diff
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
