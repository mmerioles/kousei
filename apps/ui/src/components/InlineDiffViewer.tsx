import type { DemoDiff } from "../demoData";

type Props = {
  diff: DemoDiff;
  sha256: string;
};

export function InlineDiffViewer({ diff, sha256 }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
      <div className="border-b border-line bg-slate-50 px-6 py-4">
        <div className="grid min-h-[24px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Inline diff</div>
            <div className="truncate font-mono text-[11px] text-slate-400">SHA256: {sha256}</div>
          </div>
          <div className="text-sm font-medium text-transparent select-none">Download config</div>
        </div>
      </div>
      <div className="bg-white p-4">
        <div className="max-h-[78vh] overflow-auto rounded-xl border border-line bg-slate-950 p-5 font-mono text-[13px] leading-6 text-slate-100">
          {diff.lines.map((line, index) => {
            const base = "grid grid-cols-[56px_minmax(0,1fr)] gap-4 rounded-xl px-3 py-1.5";
            const style =
              line.type === "add"
                ? "bg-emerald-500/14 text-emerald-200"
                : line.type === "remove"
                  ? "bg-rose-500/14 text-rose-200"
                  : "text-slate-300";
            const marker = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
            const text = line.type === "remove" ? line.left : line.right ?? line.left ?? "";

            return (
              <div className={`${base} ${style}`} key={`${line.type}-${index}`}>
                <span className="select-none text-right text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                <span className="whitespace-pre-wrap break-words">
                  <span className="mr-3 select-none text-slate-500">{marker}</span>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
