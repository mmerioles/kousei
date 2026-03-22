import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  demoDiffs,
  demoFleetDevices,
  demoRevisions,
  demoTimeline,
  type DemoDiff,
  type DemoFleetDevice,
  type DemoRevision,
  type DemoTimelineNode,
} from "./demoData";

type RevisionOverride = {
  label: string;
  note: string;
};

type DiffOverride = {
  title: string;
  summary: string;
};

type MetadataOverrides = {
  revisions: Record<string, RevisionOverride>;
  diffs: Record<string, DiffOverride>;
};

type DemoDataContextValue = {
  revisions: DemoRevision[];
  diffs: DemoDiff[];
  timeline: DemoTimelineNode[];
  fleetDevices: DemoFleetDevice[];
  getRevisionById: (id: string) => DemoRevision;
  getDiffById: (id: string) => DemoDiff;
  updateRevision: (id: string, updates: RevisionOverride) => void;
  updateDiff: (id: string, updates: DiffOverride) => void;
};

const STORAGE_KEY = "kousei-demo-metadata";

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

function readOverrides(): MetadataOverrides {
  if (typeof window === "undefined") {
    return { revisions: {}, diffs: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { revisions: {}, diffs: {} };
    }

    const parsed = JSON.parse(raw) as Partial<MetadataOverrides>;
    return {
      revisions: parsed.revisions ?? {},
      diffs: parsed.diffs ?? {},
    };
  } catch {
    return { revisions: {}, diffs: {} };
  }
}

export function DemoDataProvider({ children }: PropsWithChildren) {
  const [overrides, setOverrides] = useState<MetadataOverrides>(() => readOverrides());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const revisions = useMemo(
    () =>
      demoRevisions.map((revision) => {
        const override = overrides.revisions[revision.id];
        return override ? { ...revision, ...override } : revision;
      }),
    [overrides.revisions],
  );

  const diffs = useMemo(
    () =>
      demoDiffs.map((diff) => {
        const override = overrides.diffs[diff.id];
        return override ? { ...diff, ...override } : diff;
      }),
    [overrides.diffs],
  );

  const revisionMap = useMemo(() => new Map(revisions.map((revision) => [revision.id, revision])), [revisions]);
  const diffMap = useMemo(() => new Map(diffs.map((diff) => [diff.id, diff])), [diffs]);

  const timeline = useMemo(
    () =>
      demoTimeline.map((item) => {
        if (item.kind === "snapshot" && item.revisionId) {
          const revision = revisionMap.get(item.revisionId);
          if (revision) {
            return {
              ...item,
              title: revision.label,
              note: revision.note,
            };
          }
        }

        if (item.kind === "diff" && item.diffId) {
          const diff = diffMap.get(item.diffId);
          if (diff) {
            return {
              ...item,
              title: diff.title,
              note: diff.summary,
            };
          }
        }

        return item;
      }),
    [diffMap, revisionMap],
  );

  const fleetDevices = useMemo(
    () =>
      demoFleetDevices.map((device) => {
        const revision = revisionMap.get(device.latestRevisionId);
        if (!revision) {
          return device;
        }

        return {
          ...device,
          summary: revision.note,
        };
      }),
    [revisionMap],
  );

  const getRevisionById = useCallback((id: string) => revisionMap.get(id) ?? revisions[0], [revisionMap, revisions]);
  const getDiffById = useCallback((id: string) => diffMap.get(id) ?? diffs[0], [diffMap, diffs]);

  const updateRevision = useCallback((id: string, updates: RevisionOverride) => {
    setOverrides((current) => ({
      ...current,
      revisions: {
        ...current.revisions,
        [id]: updates,
      },
    }));
  }, []);

  const updateDiff = useCallback((id: string, updates: DiffOverride) => {
    setOverrides((current) => ({
      ...current,
      diffs: {
        ...current.diffs,
        [id]: updates,
      },
    }));
  }, []);

  const value = useMemo<DemoDataContextValue>(
    () => ({
      revisions,
      diffs,
      timeline,
      fleetDevices,
      getRevisionById,
      getDiffById,
      updateRevision,
      updateDiff,
    }),
    [diffs, fleetDevices, getDiffById, getRevisionById, revisions, timeline, updateDiff, updateRevision],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);

  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }

  return context;
}
