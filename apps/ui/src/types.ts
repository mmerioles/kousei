export type Device = {
  id: number;
  hostname: string;
  mgmt_ip: string;
  vendor: string;
  platform: string;
  credentials_ref?: string | null;
  polling_interval: number;
  enabled: boolean;
  username: string;
  last_seen?: string | null;
  created_at: string;
};

export type Event = {
  id: number;
  device_id: number;
  occurred_at: string;
  source: string;
  event_type: string;
  raw_payload: Record<string, unknown>;
};

export type Overview = {
  device_count: number;
  snapshot_count: number;
  diff_count: number;
  recent_events: Event[];
};

export type TimelineEntry = {
  timestamp: string;
  kind: "event" | "snapshot" | "diff";
  payload: Record<string, unknown>;
};

export type DiffPayload = {
  diff: {
    id: number;
    summary: string;
    raw_diff: string;
    semantic_diff: Record<string, unknown>;
    created_at: string;
  };
  attribution?: {
    actor: string;
    confidence: number;
    evidence: Record<string, unknown>;
  } | null;
};
