function sanitize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildSnapshotFilename(hostname: string, label: string, timestamp: string) {
  const date = timestamp.slice(0, 10);
  const time = timestamp.slice(11, 16).replace(":", "");
  return `${sanitize(hostname)}_${date}_${time}_${sanitize(label)}.cfg`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
