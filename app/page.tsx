"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "Seed" | "Shaping" | "Testing" | "Parked";

type Idea = {
  id: string;
  title: string;
  body: string;
  status: Status;
  createdAt: number;
};

const STATUSES: Status[] = ["Seed", "Shaping", "Testing", "Parked"];

const SEED: Idea[] = [
  {
    id: "last-useful-view",
    title: "Make the last useful view easy to return to",
    body: "A small product should remember the moment that helped, not just the account that visited.",
    status: "Shaping",
    createdAt: Date.parse("2026-08-18"),
  },
  {
    id: "decision-trail",
    title: "Export a decision trail without opening a spreadsheet",
    body: "Turn a short experiment into a portable note: question, signal, decision, next move.",
    status: "Testing",
    createdAt: Date.parse("2026-08-15"),
  },
  {
    id: "quiet-onboarding",
    title: "A quieter first run for tools with many possibilities",
    body: "Let a person choose one useful starting point before showing the full surface area.",
    status: "Seed",
    createdAt: Date.parse("2026-08-11"),
  },
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // The browser store is external state; hydration intentionally follows this read.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Keep the deterministic seed if browser storage is unavailable.
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);

  return [value, setValue] as const;
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `idea-${Date.now()}`;
}

function SignalBars({ seed }: { seed: string }) {
  const bars = Array.from({ length: 22 }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) || 47;
    return 1 + ((code + index * 7) % 4);
  });

  return (
    <span className="idea-signal" aria-hidden="true">
      {bars.map((width, index) => (
        <i key={`${seed}-${index}`} style={{ width: `${width}px` }} />
      ))}
    </span>
  );
}

export default function Home() {
  const [ideas, setIdeas] = useLocalStorage<Idea[]>("idea-field-v2", SEED);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(SEED[0]?.id ?? null);
  const [draft, setDraft] = useState({ title: "", body: "", status: "Seed" as Status });
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ideas.filter((idea) => {
      const matchesStatus = statusFilter === "All" || idea.status === statusFilter;
      const matchesQuery = !needle || `${idea.title} ${idea.body} ${idea.status}`.toLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [ideas, query, statusFilter]);

  const selected = ideas.find((idea) => idea.id === selectedId) ?? filtered[0] ?? ideas[0];

  function addIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setNotice("Give the thought a title before placing it in the field.");
      return;
    }

    const idea: Idea = {
      id: createId(),
      title,
      body: draft.body.trim() || "No detail yet. The next question can sharpen it.",
      status: draft.status,
      createdAt: Date.now(),
    };
    setIdeas((current) => [idea, ...current]);
    setSelectedId(idea.id);
    setStatusFilter("All");
    setDraft({ title: "", body: "", status: "Seed" });
    setNotice("Thought placed in the field.");
  }

  function removeIdea(id: string) {
    setIdeas((current) => {
      const remaining = current.filter((idea) => idea.id !== id);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
      return remaining;
    });
    setNotice("Thought removed from this browser.");
  }

  return (
    <main className="idea-field">
      <div className="field-frame">
        <header className="field-header">
          <div className="field-mark">
            <span className="mark-bars" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>IDEA / FIELD</span>
          </div>
          <p>LOCAL NOTEBOOK · {ideas.length.toString().padStart(2, "0")} THOUGHTS</p>
        </header>

        <section className="field-intro" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">Give a loose thought one next move.</h1>
            <p>A local idea instrument for keeping a question visible long enough to shape it, test it, or deliberately park it.</p>
          </div>
          <div className="field-readout">
            <strong>{filtered.length.toString().padStart(2, "0")}</strong>
            <span>VISIBLE<br />SIGNALS</span>
          </div>
        </section>

        <section className="field-console" aria-label="Idea field workspace">
          <div className="capture-bay">
            <p className="section-label">CAPTURE BAY</p>
            <h2>Put the rough version here.</h2>
            <p className="capture-note">No scoring, no fake roadmap. A thought earns its place by getting a useful next sentence.</p>
            <form onSubmit={addIdea} className="capture-form">
              <label>
                <span>Thought title</span>
                <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="What keeps returning?" required />
              </label>
              <label>
                <span>Working note</span>
                <textarea value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} placeholder="What might be true?" rows={4} />
              </label>
              <label>
                <span>Current signal</span>
                <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Status }))}>
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <button className="place-button" type="submit">Place in field <span aria-hidden="true">↗</span></button>
            </form>
            <p className="form-notice" role="status" aria-live="polite">{notice}</p>
          </div>

          <div className="field-reading">
            <div className="reading-toolbar">
              <label className="search-field">
                <span>SCAN THE FIELD</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search thoughts" />
              </label>
              <div className="status-filter" role="group" aria-label="Filter thoughts by signal">
                {(["All", ...STATUSES] as const).map((status) => (
                  <button key={status} type="button" aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)}>{status}</button>
                ))}
              </div>
            </div>

            <div className="reading-heading">
              <p className="section-label">FIELD INDEX</p>
              <span>{filtered.length} / {ideas.length} SHOWING</span>
            </div>

            {filtered.length > 0 ? (
              <ul className="idea-list">
                {filtered.map((idea) => (
                  <li key={idea.id}>
                    <button type="button" className={`idea-row${selected?.id === idea.id ? " is-selected" : ""}`} onClick={() => setSelectedId(idea.id)}>
                      <span className="idea-row-topline"><span>{idea.status}</span><time dateTime={new Date(idea.createdAt).toISOString()}>{new Date(idea.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</time></span>
                      <strong>{idea.title}</strong>
                      <span className="idea-row-bottom"><SignalBars seed={idea.title} /><span>{idea.body}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-field"><strong>No signal in this range.</strong><span>Clear the scan or place a new thought in the field.</span></div>
            )}

            {selected && (
              <article className="selected-reading" aria-labelledby="selected-title">
                <div className="selected-rule" aria-hidden="true" />
                <div className="selected-header">
                  <p className="section-label">CURRENT READING</p>
                  <button type="button" className="remove-button" onClick={() => removeIdea(selected.id)}>Remove</button>
                </div>
                <h2 id="selected-title">{selected.title}</h2>
                <p>{selected.body}</p>
                <div className="selected-meta">
                  <span><b>STATE</b>{selected.status}</span>
                  <span><b>RECORDED</b>{new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              </article>
            )}
          </div>
        </section>

        <footer className="field-footer">
          <span>IDEA / FIELD · PRIVATE BY DEFAULT</span>
          <span>State stays in this browser. No account. No pretend intelligence.</span>
        </footer>
      </div>
    </main>
  );
}
