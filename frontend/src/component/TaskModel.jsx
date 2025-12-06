import React, { useState } from "react";
import { updateTask, deleteTask } from "../services/api";

export default function TaskModal({ task, onClose }) {
  const [form, setForm] = useState({ ...task });
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      await updateTask(task._id, form);
      setSaving(false);
      onClose && onClose(true);
    } catch (e) {
      console.error(e);
      setSaving(false);
      alert("Failed to save");
    }
  }

  async function remove() {
    if (!confirm("Delete task?")) return;
    try {
      await deleteTask(task._id);
      onClose && onClose(true);
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  }

  return (
    <div>
      <h3>Edit Task</h3>
      <label>Title</label>
      <input
        className="input"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <label>Description</label>
      <textarea
        className="input"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label>Priority</label>
      <select
        className="input"
        value={form.priority}
        onChange={(e) => setForm({ ...form, priority: e.target.value })}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
        <option>Critical</option>
      </select>
      <label>Status</label>
      <select
        className="input"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>
      <label>Due Date (ISO)</label>
      <input
        className="input"
        value={form.dueDate || ""}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value || null })}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="button" onClick={() => onClose && onClose(false)}>
          Close
        </button>
        <button className="button" onClick={remove}>
          Delete
        </button>
      </div>
    </div>
  );
}
