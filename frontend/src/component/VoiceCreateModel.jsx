import React, { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import { parseTranscript, createTask } from "../services/api";

/**
 * VoiceCreateModal
 * Props:
 *  - onClose() => void
 *  - onCreated(task) => void
 *
 * Flow:
 * 1. User clicks Record in VoiceRecorder
 * 2. VoiceRecorder calls onTranscript(text, isFinal)
 * 3. When isFinal is true, we call parseTranscript(text)
 * 4. Show parsed preview fields; user can edit
 * 5. On Create -> POST to /api/tasks via createTask
 */
export default function VoiceCreateModal({ onClose, onCreated }) {
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null); // { title, description, priority, status, dueDate }
  const [loadingParse, setLoadingParse] = useState(false);
  const [creating, setCreating] = useState(false);

  // Called from VoiceRecorder with (text, isFinal)
  async function handleTranscript(text, isFinal) {
    setTranscript(text || "");
    // Only parse when a final segment arrives to reduce calls
    if (isFinal) {
      if (!text || !text.trim()) return;
      setLoadingParse(true);
      try {
        const res = await parseTranscript(text);
        // backend returns { transcript, parsed } or { transcript, parsed, warning }
        const p = res && (res.parsed || res);
        // normalize expected shape
        setParsed({
          title: p?.title ?? "",
          description: p?.description ?? "",
          priority: p?.priority ?? "Medium",
          status: p?.status ?? "To Do",
          dueDate: p?.dueDate ?? null,
        });
      } catch (err) {
        console.error("Parse failed", err);
        // fallback: treat full transcript as the title
        setParsed({
          title: text,
          description: "",
          priority: "Medium",
          status: "To Do",
          dueDate: null,
        });
      } finally {
        setLoadingParse(false);
      }
    }
  }

  async function handleCreate() {
    if (!parsed || !parsed.title || !parsed.title.trim()) {
      return alert("Please provide a title for the task.");
    }
    setCreating(true);
    try {
      // backend expects dueDate as ISO or null; allow user-provided natural language date too
      const payload = {
        title: parsed.title.trim(),
        description: parsed.description || "",
        priority: parsed.priority || "Medium",
        status: parsed.status || "To Do",
        dueDate: parsed.dueDate || null,
      };
      const created = await createTask(payload);
      onCreated && onCreated(created);
      onClose && onClose();
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create task. Check console for details.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h3>Create Task by Voice</h3>

      <VoiceRecorder onTranscript={handleTranscript} autoStopMs={3500} />

      <div style={{ marginTop: 12 }}>
        <label className="small" style={{ display: "block", marginBottom: 6 }}>
          Raw transcript
        </label>
        <div
          className="input"
          style={{ minHeight: 48, whiteSpace: "pre-wrap" }}
        >
          {transcript || (
            <span className="small">No transcript captured yet</span>
          )}
        </div>
      </div>

      {loadingParse && (
        <div className="small" style={{ marginTop: 8 }}>
          Parsing transcript…
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 12 }}>
          <label>Title</label>
          <input
            className="input"
            value={parsed.title}
            onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
          />

          <label>Description</label>
          <textarea
            className="input"
            rows={3}
            value={parsed.description}
            onChange={(e) =>
              setParsed({ ...parsed, description: e.target.value })
            }
          />

          <label>Due Date (ISO or natural text)</label>
          <input
            className="input"
            value={parsed.dueDate || ""}
            onChange={(e) =>
              setParsed({ ...parsed, dueDate: e.target.value || null })
            }
            placeholder="e.g., next Wednesday at 6pm"
          />

          <label>Priority</label>
          <select
            className="input"
            value={parsed.priority}
            onChange={(e) => setParsed({ ...parsed, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <label>Status</label>
          <select
            className="input"
            value={parsed.status}
            onChange={(e) => setParsed({ ...parsed, status: e.target.value })}
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="button primary"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "Creating…" : "Create Task"}
            </button>
            <button className="button" onClick={() => onClose && onClose()}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!parsed && !loadingParse && (
        <div className="small" style={{ marginTop: 8 }}>
          Speak into the microphone. After a short pause the transcript will be
          parsed and a preview shown.
        </div>
      )}
    </div>
  );
}
