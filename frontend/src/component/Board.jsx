import React from "react";
import Column from "./Column";
import { DragDropContext } from "@hello-pangea/dnd";

export default function Board({ tasks, onMove, filters }) {
  const statuses = ["To Do", "In Progress", "Done"];

  // filter tasks according to filters.search / filters.priority / filters.status
  const filtered = tasks.filter((t) => {
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      if (
        !t.title.toLowerCase().includes(s) &&
        !t.description.toLowerCase().includes(s)
      )
        return false;
    }
    if (
      filters?.priority &&
      filters.priority !== "All" &&
      t.priority !== filters.priority
    )
      return false;
    if (
      filters?.status &&
      filters.status !== "All" &&
      t.status !== filters.status
    )
      return false;
    return true;
  });

  const byStatus = {};
  statuses.forEach(
    (s) => (byStatus[s] = filtered.filter((t) => t.status === s))
  );

  function onDragEnd(result) {
    if (!result.destination) return;
    const destCol = result.destination.droppableId;
    const taskId = result.draggableId;
    if (destCol === result.source.droppableId) return; // same column
    onMove(taskId, destCol);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {statuses.map((status) => (
          <Column key={status} status={status} tasks={byStatus[status]} />
        ))}
      </div>
    </DragDropContext>
  );
}
