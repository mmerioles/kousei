type Props = {
  content: string;
  onDownload: () => void;
  sha256: string;
};

export function ConfigViewer({ content, onDownload, sha256 }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel shadow-panel">
      <div className="border-b border-line bg-slate-50 px-6 py-4">
        <div className="grid min-h-[24px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <div className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Running config</div>
            <div className="truncate font-mono text-[11px] text-slate-400">SHA256: {sha256}</div>
          </div>
          <button className="text-sm font-medium text-accent underline decoration-transparent underline-offset-4 transition hover:decoration-current" onClick={onDownload} type="button">
            Download config
          </button>
        </div>
      </div>
      <div className="bg-white p-4">
        <pre className="max-h-[78vh] overflow-auto rounded-xl border border-line bg-slate-950 p-5 font-mono text-[13px] leading-6 text-slate-100">
          {content}
        </pre>
      </div>
    </section>
  );
}
