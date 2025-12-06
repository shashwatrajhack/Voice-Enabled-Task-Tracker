import React, { useEffect, useState } from "react";
import { getTasks, updateTask } from "./services/api";
import Board from "./component/Board";
import VoiceCreateModal from "./component/VoiceCreateModel";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showVoice, setShowVoice] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onMove(taskId, newStatus) {
    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to move task");
    }
  }

  function onCreated(task) {
    setTasks((prev) => [task, ...prev]);
  }

  const filters = { search, priority: filterPriority, status: filterStatus };

  return (
    <div className="app">
      <div className="header">
        <h1>Voice-Enabled Task Tracker</h1>
        <div className="controls">
          <input
            className="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="search"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <select
            className="search"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <button className="button" onClick={() => setShowVoice(true)}>
            🎤 Create by Voice
          </button>
        </div>
      </div>

      {loading ? (
        <div className="small">Loading...</div>
      ) : (
        <Board tasks={tasks} onMove={onMove} filters={filters} />
      )}

      {showVoice && (
        <div className="modal">
          <div className="panel">
            <VoiceCreateModal
              onClose={() => setShowVoice(false)}
              onCreated={onCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
