import { NavLink, Route, Routes } from "react-router-dom";
import { DeviceDetailPage } from "./pages/DeviceDetailPage";
import { DevicesPage } from "./pages/DevicesPage";
import { DiffPage } from "./pages/DiffPage";
import { EventsPage } from "./pages/EventsPage";
import { OverviewPage } from "./pages/OverviewPage";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/devices", label: "History Browser" },
  { to: "/diffs/diff-2", label: "Latest Diff" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-8 md:px-8">
        <header className="rounded-2xl border border-line bg-panel p-6 shadow-panel">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Kousei</p>
              <h1 className="mt-2 text-4xl font-semibold">Site 1 / LAB-FABRIC-A</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Network configuration history workspace for the active lab dataset. Current scope includes revision
                timelines, inline diffs, event context, and operator-authored change labels for the tracked device set.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 rounded-xl border border-line bg-slate-50 p-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive ? "bg-white text-ink shadow-sm" : "text-slate-600"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/:deviceId" element={<DeviceDetailPage />} />
          <Route path="/diffs/:diffId" element={<DiffPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </div>
    </div>
  );
}
