import { useRef, useState } from "react";
import { FolderOpen, Save, Download, Upload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listSessions, saveSession, loadSession, deleteSession, exportSessionJson, parseSessionJson } from "@/store/sessions";
import { formatIst } from "@/engine/timelineEngine";
import type { SessionSnapshot } from "@/store/simulationStore";

export function SessionMenu() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setSessions(listSessions());
  const toggle = () => {
    if (!open) refresh();
    setOpen(!open);
    setMsg(null);
  };

  return (
    <div className="relative">
      <Button variant="secondary" onClick={toggle} title="Save / load simulation sessions">
        <FolderOpen /> Session
      </Button>
      {open && (
        <div className="absolute right-0 top-9 z-[2000] w-[340px] border border-ink-600 bg-ink-850 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="label-caps">Simulation sessions</span>
            <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-100" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex gap-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Session name"
              className="h-7 flex-1 border border-ink-600 bg-ink-900 px-2 text-[12px] outline-none focus:border-olive-500"
            />
            <Button
              onClick={() => {
                const n = name.trim() || `Session ${new Date().toLocaleString()}`;
                saveSession(n);
                setName("");
                refresh();
                setMsg(`Saved "${n}" to this browser.`);
              }}
            >
              <Save /> Save
            </Button>
          </div>
          <div className="mt-2 flex gap-1">
            <Button variant="secondary" size="sm" onClick={() => exportSessionJson(name.trim() || "current")}>
              <Download /> Export JSON
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload /> Import JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  loadSession(parseSessionJson(await f.text()));
                  setMsg(`Loaded "${f.name}".`);
                } catch (err) {
                  setMsg((err as Error).message);
                }
                e.target.value = "";
              }}
            />
          </div>
          {msg && <div className="mt-2 text-[11px] text-olive-300">{msg}</div>}
          <div className="mt-3 max-h-[260px] overflow-auto border-t border-ink-700 pt-2">
            {sessions.length === 0 && <div className="text-[11px] text-ink-500">No saved sessions in this browser.</div>}
            {sessions.map((s) => (
              <div key={s.name} className="flex items-center gap-2 border-b border-ink-800 py-1.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px]">{s.name}</div>
                  <div className="mono text-[10px] text-ink-500">clock {formatIst(s.simTime)}</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    loadSession(s);
                    setMsg(`Loaded "${s.name}".`);
                  }}
                >
                  Load
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  title="Delete saved session"
                  onClick={() => {
                    deleteSession(s.name);
                    refresh();
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
