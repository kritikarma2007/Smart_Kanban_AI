import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, AlignLeft, Trash2 } from 'lucide-react';

export default function TaskCard({ task, index, onDeleteTask }) {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const [completedSubtasks, setCompletedSubtasks] = useState(() =>
    Array.isArray(task.subtasks) ? task.subtasks.map(() => false) : []
  );

  const shortDescription =
    typeof task.description === 'string'
      ? task.description.replace(/\s+/g, ' ').trim()
      : '';
  const trimmedDescription = shortDescription
    ? shortDescription.length > 92
      ? `${shortDescription.slice(0, 89)}...`
      : shortDescription
    : '';

  const toggleSubtask = (i) => {
    setCompletedSubtasks((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          className={`mb-3 p-4 rounded-xl border flex flex-col justify-between min-h-[220px] max-h-[340px] transition-all duration-200 select-none ${
            snapshot.isDragging
              ? 'bg-[#211b3e]/90 border-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.35)] rotate-[1.5deg] scale-[1.02]'
              : 'bg-white/5 hover:bg-white/8 border-white/5 hover:border-white/10 shadow-lg'
          }`}
        >
          {/* Top Section: Priority & Meta */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span
                className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority || 'low'}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-white mb-1.5 tracking-wide line-clamp-1 leading-snug">
              {task.title}
            </h4>

            {/* Description */}
            {trimmedDescription && (
              <p className="mb-2.5 text-[11px] leading-relaxed text-gray-400 line-clamp-2">
                {trimmedDescription}
              </p>
            )}
          </div>

          {/* Middle Section: Checklist */}
          {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
            <div className="my-2 rounded-lg border border-white/10 bg-black/10 p-2.5">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                Checklist
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {task.subtasks.map((sub, i) => {
                  const label = typeof sub === 'string' ? sub : sub?.title || sub?.text || '';
                  const isDone = !!completedSubtasks[i];

                  return (
                    <li
                      key={`sub-${i}`}
                      className={`flex items-start gap-2 rounded-md px-2 py-1 transition-colors ${
                        isDone ? 'bg-white/5' : 'bg-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleSubtask(i)}
                        className="mt-0.6 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-white/10 bg-transparent accent-[#7c3aed] focus:ring-0"
                      />
                      <span
                        className={`flex-1 break-words leading-relaxed transition-all ${
                          isDone ? 'subtask-complete' : 'text-gray-300'
                        }`}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Bottom Section: Footer Info */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2 text-[10px] text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-[#7c3aed]" />
              <span className="truncate max-w-[70px] sm:max-w-none">{task.dueDate || 'No date'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {task.description && <AlignLeft className="h-3 w-3 text-gray-500" />}
              
              <button
                type="button"
                onClick={() => onDeleteTask?.(task.id)}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3 text-red-300" />
              </button>

              <div 
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 text-[9px] font-bold text-white uppercase"
                title={task.assignee ? `Assigned to ${task.assignee}` : 'AI Generated Task'}
              >
                {task.assignee ? task.assignee.substring(0, 2) : 'AI'}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}