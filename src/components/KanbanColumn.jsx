import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export default function KanbanColumn({ column, tasks, onAddTask, onDeleteTask }) {
  const getHeaderColor = (id) => {
    switch (id) {
      case 'todo':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'inprogress':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'review':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'done':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      default:
        return 'bg-white/5 text-white border-white/10';
    }
  };

  return (
    <div className="flex flex-col w-full min-w-[270px] max-w-[350px] h-[calc(100vh-270px)] min-h-[450px] rounded-2xl bg-[#120f22]/75 backdrop-blur-md border border-white/5 p-4 flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getHeaderColor(column.id)}`}>
            {column.title}
          </span>
          <span className="text-xs text-gray-500 font-semibold">{tasks.length}</span>
        </div>
        
        {/* Add Task Button */}
        <button
          onClick={() => onAddTask(column.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:border-[#7c3aed]/50 text-gray-400 hover:text-white hover:bg-[#7c3aed]/10 transition-all duration-300 cursor-pointer"
          title="Add new task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 rounded-xl transition-all duration-200 ${
              snapshot.isDraggingOver ? 'bg-white/[0.02] ring-1 ring-white/5' : ''
            }`}
          >
            <div className="min-h-full py-1">
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onDeleteTask={onDeleteTask} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
