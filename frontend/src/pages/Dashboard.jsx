import React, { useState, useEffect } from 'react';
import client from '../api/client';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, RefreshCw, Layers, ArrowLeft, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [page, setPage] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  
  const { showToast } = useAuth();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit: 6, // 6 items per page fits 3-column layout nicely
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await client.get('/api/v1/tasks', { params: queryParams });
      if (response.data?.success) {
        setTasks(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  // Debounced search handle
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchVal }));
      setPage(1); // Reset to page 1 on new search
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await client.post('/api/v1/tasks', taskData);
      if (response.data?.success) {
        showToast('Task created successfully!', 'success');
        setIsFormOpen(false);
        fetchTasks();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create task';
      showToast(msg, 'error');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await client.patch(`/api/v1/tasks/${activeTask.id}`, taskData);
      if (response.data?.success) {
        showToast('Task updated successfully!', 'success');
        setIsFormOpen(false);
        setActiveTask(null);
        fetchTasks();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update task';
      showToast(msg, 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await client.patch(`/api/v1/tasks/${taskId}`, { status: newStatus });
      if (response.data?.success) {
        showToast('Task status updated!', 'success');
        // Instantly update task status in state to feel responsive
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await client.delete(`/api/v1/tasks/${taskId}`);
      if (response.data?.success) {
        showToast('Task deleted successfully.', 'success');
        fetchTasks();
      }
    } catch (error) {
      showToast('Failed to delete task.', 'error');
    }
  };

  const openEditModal = (task) => {
    setActiveTask(task);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setActiveTask(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-400" />
            <span>Tasks Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage and track your primary tasks and deadlines.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="border border-slate-800 bg-slate-900/20 p-5 rounded-xl backdrop-blur-md mb-2">
        <div className="flex items-center gap-2 mb-4 text-cyan-400 border-b border-slate-800/50 pb-3">
          <Filter className="h-4 w-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider">Task Filters & Search</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-650 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Priority Level</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Listing Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RefreshCw className="h-10 w-10 text-cyan-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Fetching tasks database...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <Layers className="h-12 w-12 text-slate-700 mb-3" />
          <h3 className="font-semibold text-white text-base">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
            There are no tasks matching your query. Create a new task or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4">Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-5">
              <span className="text-xs text-slate-400">
                Showing page <strong className="text-white">{meta.page}</strong> of <strong className="text-white">{meta.totalPages}</strong> ({meta.total} total tasks)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          task={activeTask}
          onSubmit={activeTask ? handleUpdateTask : handleCreateTask}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
