"use client";

/**
 * Connections — sync devices. Create shows the token ONCE with the exact
 * command to run; the list shows last-sync per device and revoke.
 */
import { useCallback, useEffect, useState } from "react";

type Device = { id: string; device_name: string | null; last_synced_at: string | null; revoked: boolean; created_at: string };

export function DevicesManager({ syncUrl }: { syncUrl: string }) {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [name, setName] = useState("");
  const [minted, setMinted] = useState<{ token: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cloud/devices");
      const data = await res.json();
      setDevices(Array.isArray(data.devices) ? data.devices : []);
    } catch { setDevices([]); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function create() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/cloud/devices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "My machine" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      setMinted({ token: data.token, name: name.trim() || "My machine" });
      setName("");
      void refresh();
    } catch (e) {
      setError("Couldn't create the token: " + (e as Error).message);
    } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this token? That machine's syncs stop immediately. Already-synced data stays.")) return;
    await fetch("/api/cloud/devices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoke: id }),
    });
    void refresh();
  }

  return (
    <div className="ck-devices">
      <div className="ck-devnew">
        <label className="sr-only" htmlFor="dev-name">Device name</label>
        <input id="dev-name" onChange={(e) => setName(e.target.value)} placeholder="Name this machine — e.g. MacBook Pro (work)" value={name} />
        <button disabled={busy} onClick={create} type="button">{busy ? "Creating…" : "Create sync token"}</button>
      </div>
      {error ? <p className="cws-error" role="alert">{error}</p> : null}
      {minted ? (
        <div className="ck-minted" role="status">
          <p><strong>Token for “{minted.name}” — shown once, copy it now.</strong></p>
          <pre className="ck-code">npx pmm-os sync {syncUrl} {minted.token}</pre>
          <button onClick={() => { navigator.clipboard.writeText(`npx pmm-os sync ${syncUrl} ${minted.token}`).catch(() => {}); }} type="button">Copy command</button>
          <button className="ghost" onClick={() => setMinted(null)} type="button">Done — I saved it</button>
        </div>
      ) : null}
      {devices === null ? (
        <p className="ck-note">Loading devices…</p>
      ) : devices.length === 0 ? (
        <p className="ck-note">No machines connected yet — the token you create above is the whole setup.</p>
      ) : (
        <div className="rows">
          {devices.map((d) => (
            <div className="row" key={d.id}>
              <div>
                <div className="t">{d.device_name || "unnamed"}{d.revoked ? " · revoked" : ""}</div>
                <div className="d">
                  {d.last_synced_at ? "last sync " + new Date(d.last_synced_at).toLocaleString() : "never synced"}
                  {" · added " + new Date(d.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="meta">
                {!d.revoked ? <button className="ck-revoke" onClick={() => revoke(d.id)} type="button">Revoke</button> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
