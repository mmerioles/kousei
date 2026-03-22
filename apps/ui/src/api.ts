import type { Device, DiffPayload, Event, Overview, TimelineEntry } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getOverview: () => request<Overview>("/overview"),
  listDevices: () => request<Device[]>("/devices"),
  getDevice: (id: string) => request<Device>(`/devices/${id}`),
  listTimeline: (id: string) => request<TimelineEntry[]>(`/devices/${id}/timeline`),
  getDiff: (id: string) => request<DiffPayload>(`/diffs/${id}`),
  listEvents: () => request<Event[]>("/events"),
  createDevice: (payload: Record<string, unknown>) =>
    request<Device>("/devices", { method: "POST", body: JSON.stringify(payload) }),
  collectDevice: (id: number) =>
    request(`/devices/${id}/collect`, { method: "POST", body: JSON.stringify({ cause: "manual" }) }),
};
