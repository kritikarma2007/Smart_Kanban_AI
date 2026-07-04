import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ boardData, onDragEnd, onAddTask, onDeleteTask }) {
  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragEnd = (result) => {
    if (typeof onDragEnd === 'function') {
      onDragEnd(result);
      return;
    }

    const { destination, source } = result;

    // Dropped outside the list
    if (!destination) return;

    // No movement
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceList = [...boardData[source.droppableId]];
    const destList = source.droppableId === destination.droppableId 
      ? sourceList 
      : [...boardData[destination.droppableId]];

    const [removed] = sourceList.splice(source.index, 1);
    
    // Set updated values
    destList.splice(destination.index, 0, removed);

    const newBoard = {
      ...boardData,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destList
    };

    if (typeof onDragEnd === 'function') {
      onDragEnd({ source, destination, task: removed });
    }

    setBoardData(newBoard);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-row overflow-x-auto gap-6 pb-6 scrollbar-thin justify-between items-start w-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={boardData[column.id] || []}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
