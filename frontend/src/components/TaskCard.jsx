import React from 'react';
import { Calendar, Trash2, Edit3, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, isAdminView = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'IN_PROGRESS': return 'bg-sky-950/60 text-sky-400 border-sky-800/50';
      case 'DONE': return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-blue-950/40 text-blue-400 border-blue-900/30';
      case 'MEDIUM': return 'bg-slate-900 text-slate-300 border-slate-800';
      case 'HIGH': return 'bg-orange-950/50 text-orange-400 border-orange-900/40';
      case 'URGENT': return 'bg-rose-950/80 text-rose-400 border-rose-900/50 animate-pulse';
      default: return 'bg-slate-900 text-slate-300';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return 'Due: ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        {/* Header (Title + Actions) */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-white text-base leading-tight break-words flex-1">
            {task.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all"
              title="Edit Task"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Task description */}
        <p className="mt-2 text-sm text-slate-400 break-words line-clamp-3">
          {task.description || <span className="italic text-slate-600">No description provided</span>}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/60">
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
            Status: {task.status.replace('_', ' ')}
          </span>
          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            Priority: {task.priority}
          </span>
        </div>

        {/* Meta Row (Due Date / Owner) */}
        <div className="flex flex-col gap-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatDate(task.dueDate)}</span>
          </div>

          {isAdminView && task.user && (
            <div className="flex items-center gap-1.5 mt-1 border-t border-slate-800/30 pt-1.5 text-[11px] text-cyan-400 font-mono">
              <User className="h-3.5 w-3.5 text-cyan-500" />
              <span className="truncate" title={task.user.email}>
                Owner: {task.user.name} ({task.user.role})
              </span>
            </div>
          )}
        </div>

        {/* Quick status progress actions */}
        <div className="flex gap-2 mt-1 pt-1.5 border-t border-slate-800/20">
          {task.status !== 'TODO' && (
            <button
              onClick={() => onStatusChange(task.id, 'TODO')}
              className="flex-1 text-[10px] py-1 border border-slate-800 text-slate-400 rounded hover:bg-slate-800 hover:text-white transition-all font-semibold"
            >
              To Do
            </button>
          )}
          {task.status !== 'IN_PROGRESS' && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="flex-1 text-[10px] py-1 border border-slate-800 text-sky-400 rounded hover:bg-sky-950/30 hover:border-sky-800/50 transition-all font-semibold"
            >
              In Progress
            </button>
          )}
          {task.status !== 'DONE' && (
            <button
              onClick={() => onStatusChange(task.id, 'DONE')}
              className="flex-1 text-[10px] py-1 border border-slate-800 text-emerald-400 rounded hover:bg-emerald-950/30 hover:border-emerald-800/50 transition-all font-semibold"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
