// "Send to editor" for cloud projects: a zip with the approved clips (clean
// names) and a Final Cut Pro 7 XML sequence, which Premiere Pro, DaVinci
// Resolve and Final Cut import as a timeline with the clips in approval order.

import { zipSync } from "fflate";
import { probeVideo } from "@/app/studio/cloud/media";
import { assetFileName } from "@/app/studio/nle/NleDrawer";
import type { ProjectGraph, VersionNode } from "@/app/studio/types";

const FPS = 30;

interface ExportClip {
  file: string;
  frames: number;
  width: number;
  height: number;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rate = `<rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>`;

export function sequenceName(graph: ProjectGraph) {
  return `${graph.title.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Genvo"}_Approved`;
}

export function premiereXml(name: string, clips: ExportClip[]): string {
  const width = clips[0]?.width || 1920;
  const height = clips[0]?.height || 1080;
  let start = 0;
  const items = clips
    .map((c, i) => {
      const item = `
      <clipitem id="clipitem-${i + 1}">
        <name>${esc(c.file)}</name>
        <enabled>TRUE</enabled>
        <duration>${c.frames}</duration>
        ${rate}
        <start>${start}</start>
        <end>${start + c.frames}</end>
        <in>0</in>
        <out>${c.frames}</out>
        <file id="file-${i + 1}">
          <name>${esc(c.file)}</name>
          <pathurl>${encodeURI(c.file)}</pathurl>
          ${rate}
          <duration>${c.frames}</duration>
          <media><video><samplecharacteristics><width>${c.width}</width><height>${c.height}</height></samplecharacteristics></video></media>
        </file>
      </clipitem>`;
      start += c.frames;
      return item;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-1">
    <name>${esc(name)}</name>
    <duration>${start}</duration>
    ${rate}
    <media>
      <video>
        <format><samplecharacteristics>${rate}<width>${width}</width><height>${height}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>
        <track>${items}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>
`;
}

function readme(graph: ProjectGraph, seq: string, versions: VersionNode[]) {
  const lines = versions.map(
    (v) =>
      `- ${assetFileName(graph, v)}: "${v.title}" (v${v.number}), made with ${v.settings.model}` +
      `${v.approvedBy ? `, approved by ${v.approvedBy.name}` : ""}\n  Prompt: ${v.prompt || "(none)"}`
  );
  return `${graph.title}${graph.client ? ` · ${graph.client}` : ""}
Exported from Genvo on ${new Date().toLocaleString()}

Import into your editor
  Premiere Pro:  File → Import → ${seq}.xml  (keep it in this folder with the clips)
  DaVinci Resolve: File → Import → Timeline → ${seq}.xml
  Final Cut Pro: File → Import → XML
If the editor asks where the media is, point it at this folder.

Approved takes
${lines.join("\n")}
`;
}

export async function buildEditorPackage(
  graph: ProjectGraph,
  versions: VersionNode[],
  onProgress: (done: number, total: number) => void
): Promise<{ blob: Blob; fileName: string; sequence: string }> {
  const seq = sequenceName(graph);
  const files: Record<string, Uint8Array> = {};
  const clips: ExportClip[] = [];
  for (const [i, v] of versions.entries()) {
    onProgress(i, versions.length);
    if (!v.videoUrl) throw new Error(`${v.title} has no video to export.`);
    const res = await fetch(v.videoUrl);
    if (!res.ok) throw new Error(`Couldn't download ${v.title} (${res.status}).`);
    const blob = await res.blob();
    const meta = await probeVideo(blob).catch(() => ({ duration: v.settings.duration, width: 1920, height: 1080 }));
    const file = assetFileName(graph, v);
    files[file] = new Uint8Array(await blob.arrayBuffer());
    clips.push({
      file,
      frames: Math.max(1, Math.round((meta.duration || v.settings.duration) * FPS)),
      width: meta.width || 1920,
      height: meta.height || 1080,
    });
  }
  onProgress(versions.length, versions.length);
  const enc = new TextEncoder();
  files[`${seq}.xml`] = enc.encode(premiereXml(seq, clips));
  files["README.txt"] = enc.encode(readme(graph, seq, versions));
  // Video is already compressed; store it rather than deflating again.
  const zipped = zipSync(files, { level: 0 });
  return { blob: new Blob([zipped], { type: "application/zip" }), fileName: `${seq}.zip`, sequence: seq };
}
