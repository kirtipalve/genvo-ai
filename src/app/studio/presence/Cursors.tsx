import { ViewportPortal, useViewport } from "@xyflow/react";
import { usePresence } from "@/app/studio/realtime/presence";

// Collaborators' cursors, in flow coordinates so they stay pinned to the
// canvas content when anyone pans or zooms. Deliberately neutral: a black
// arrow and a grey name chip.
export function Cursors() {
  const peers = usePresence((s) => s.peers);
  const { zoom } = useViewport();

  return (
    <ViewportPortal>
      {Object.values(peers).map((peer) =>
        peer.cursor ? (
          <div
            key={peer.user.id}
            className="gv-cursor"
            style={{
              transform: `translate(${peer.cursor.x}px, ${peer.cursor.y}px) scale(${1 / zoom})`,
              transformOrigin: "0 0",
              transition: peer.isGhost ? undefined : "transform 90ms linear",
            }}
          >
            <svg viewBox="0 0 20 24" aria-hidden="true">
              <path d="M2 1.5v17.2l4.7-4.3 3.5 7.3 2.8-1.3-3.4-7h6.1L2 1.5Z" />
            </svg>
            <span>{peer.user.name.split(" ")[0]}</span>
          </div>
        ) : null
      )}
    </ViewportPortal>
  );
}
