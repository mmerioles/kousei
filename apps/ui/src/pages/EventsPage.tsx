import { useEffect, useState } from "react";
import { api } from "../api";
import { Panel } from "../components/Panel";
import type { Event } from "../types";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.listEvents().then(setEvents);
  }, []);

  return (
    <Panel>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Event stream</div>
          <h2 className="mt-2 text-xl font-semibold">Events</h2>
        </div>
        <div className="rounded-full border border-line bg-slate-50 px-3 py-1 text-sm text-slate-500">{events.length} entries</div>
      </div>
      <div className="mt-4 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl border border-line bg-slate-50 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-ink">{event.event_type}</div>
                <div className="text-sm text-slate-600">
                  Device #{event.device_id} | {event.source}
                </div>
              </div>
              <div className="text-sm text-slate-500">{new Date(event.occurred_at).toLocaleString()}</div>
            </div>
            <pre className="mt-3 rounded-xl border border-line bg-white p-4 text-sm text-slate-700">
              {JSON.stringify(event.raw_payload, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </Panel>
  );
}
