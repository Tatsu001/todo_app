import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Folder } from '../types';
import { truncateText } from '../utils/helpers';

interface TaskItemProps {
  task: Task;
  index: number;
  allItems: (Task | Folder)[];
  onToggleComplete: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  allItems: _allItems,
  onToggleComplete,
  onTaskClick,
  onContextMenu,
}) => {

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            task-item mb-2 cursor-pointer select-none
            ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
            ${task.completed ? 'opacity-60' : ''}
          `}
          style={{
            ...provided.draggableProps.style,
          }}
          onClick={() => onTaskClick(task)}
          onContextMenu={(e) => onContextMenu(e, task.id)}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              className={`
                flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 transition-colors duration-200
                ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }
              `}
            >
              {task.completed && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`
                font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}
              `}>
                {truncateText(task.title, 50)}
              </h3>
              
              {task.memo && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {truncateText(task.memo, 100)}
                </p>
              )}
              
              {task.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`
                        px-2 py-1 text-xs rounded-full
                        ${
                          tag === 'today'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      `}
                    >
                      {tag === 'today' ? '今日' : '今週'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;