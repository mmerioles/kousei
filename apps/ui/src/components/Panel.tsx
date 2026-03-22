import type { PropsWithChildren } from "react";

export function Panel({ children }: PropsWithChildren) {
  return <section className="rounded-2xl border border-line bg-panel p-5 shadow-panel">{children}</section>;
}
