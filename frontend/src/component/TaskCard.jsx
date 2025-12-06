import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import TaskModal from "./TaskModel";

export default function TaskCard({ task, index }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided) => (
          <div
            className={`task-card priority-${task.priority}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setOpen(true)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{task.title}</strong>
                <div className="small">
                  {task.description && task.description.substring(0, 80)}
                </div>
              </div>
              <div className="small">
                {task.dueDate ? new Date(task.dueDate).toLocaleString() : ""}
              </div>
            </div>
          </div>
        )}
      </Draggable>
      {open && (
        <div className="modal">
          <div className="panel">
            <TaskModal task={task} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
