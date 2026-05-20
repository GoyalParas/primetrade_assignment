import React, { useState, useEffect } from 'react';
import client from '../api/client';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, ClipboardList, Trash2, Shield, UserCheck, RefreshCw, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'tasks'
  
  // Users management state
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  // Tasks management state
  const [tasks, setTasks] = useState([]);
  const [tasksMeta, setTasksMeta] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  const { user: currentUser, showToast } = useAuth();

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await client.get('/api/v1/admin/users', {
        params: { page: usersPage, limit: 10 },
      });
      if (response.data?.success) {
        setUsers(response.data.data);
        setUsersMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users database.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchGlobalTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await client.get('/api/v1/tasks', {
        params: { page: tasksPage, limit: 6 },
      });
      if (response.data?.success) {
        setTasks(response.data.data);
        setTasksMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching global tasks:', error);
      showToast('Failed to load global tasks.', 'error');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchGlobalTasks();
    }
  }, [activeTab, usersPage, tasksPage]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      showToast('You cannot change your own admin role.', 'error');
      return;
    }

    try {
      const response = await client.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      if (response.data?.success) {
        showToast('User role updated successfully!', 'success');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update user role';
      showToast(msg, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      showToast('You cannot delete your own admin account!', 'error');
      return;
    }

    if (!window.confirm('WARNING: Deleting this user will delete all of their associated tasks. Proceed?')) {
      return;
    }

    try {
      const response = await client.delete(`/api/v1/admin/users/${userId}`);
      if (response.data?.success) {
        showToast('User account and all tasks deleted.', 'success');
        fetchUsers();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete user';
      showToast(msg, 'error');
    }
  };

  // Task specific handles for Admin overrides
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await client.patch(`/api/v1/tasks/${taskId}`, { status: newStatus });
      if (response.data?.success) {
        showToast('Task status updated successfully!', 'success');
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this user task?')) return;
    try {
      const response = await client.delete(`/api/v1/tasks/${taskId}`);
      if (response.data?.success) {
        showToast('Task deleted successfully.', 'success');
        fetchGlobalTasks();
      }
    } catch (error) {
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const response = await client.patch(`/api/v1/tasks/${activeTask.id}`, taskData);
      if (response.data?.success) {
        showToast('Task updated successfully!', 'success');
        setIsFormOpen(false);
        setActiveTask(null);
        fetchGlobalTasks();
      }
    } catch (error) {
      showToast('Failed to update task.', 'error');
    }
  };

  const openEditModal = (task) => {
    setActiveTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
          <span>Admin Panel</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform administrative database actions, role management, and global audit.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          <span>Users Database ({usersMeta.total})</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5" />
          <span>Global Tasks Registry ({tasksMeta.total})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'users' ? (
        /* Users Tab */
        usersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading user profiles...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
              <table className="w-full border-collapse text-left text-sm text-slate-350">
                <thead className="bg-slate-900/60 font-mono text-xs uppercase text-slate-400 border-b border-slate-850">
                  <tr>
                    <th scope="col" className="px-6 py-4">User</th>
                    <th scope="col" className="px-6 py-4">Email</th>
                    <th scope="col" className="px-6 py-4">Role</th>
                    <th scope="col" className="px-6 py-4 text-center">Tasks Created</th>
                    <th scope="col" className="px-6 py-4">Registered Date</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white truncate max-w-[150px]">
                        {u.name}
                        {u.id === currentUser.id && (
                          <span className="ml-2 text-[9px] border border-cyan-500/30 px-1 rounded text-cyan-400 font-mono uppercase bg-cyan-950/20">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs select-all text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={u.id === currentUser.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-200">
                        {u._count?.tasks || 0}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={u.id === currentUser.id}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-850 transition-all disabled:opacity-30 cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Users Pagination */}
            {usersMeta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                <span className="text-xs text-slate-400">
                  Showing page <strong className="text-white">{usersMeta.page}</strong> of <strong className="text-white">{usersMeta.totalPages}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={usersPage <= 1}
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-350 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={usersPage >= usersMeta.totalPages}
                    onClick={() => setUsersPage(p => Math.min(usersMeta.totalPages, p + 1))}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-350 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* Tasks Tab */
        tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading global registry...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-850 rounded-2xl">
            <AlertCircle className="h-10 w-10 text-slate-700 mb-2" />
            <h3 className="font-semibold text-white">No tasks exist in database</h3>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-4 bg-amber-950/30 border border-amber-900/50 p-4 rounded-lg">
              <h3 className="text-amber-500 font-semibold mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Global Task Management
              </h3>
              <p className="text-xs text-amber-200/60">
                You are viewing all tasks across the entire system. Pay attention to the "Owner" label on each task card to see who it belongs to.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleUpdateTaskStatus}
                  isAdminView={true}
                />
              ))}
            </div>

            {/* Tasks Pagination */}
            {tasksMeta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                <span className="text-xs text-slate-400">
                  Showing page <strong className="text-white">{tasksMeta.page}</strong> of <strong className="text-white">{tasksMeta.totalPages}</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={tasksPage <= 1}
                    onClick={() => setTasksPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-350 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={tasksPage >= tasksMeta.totalPages}
                    onClick={() => setTasksPage(p => Math.min(tasksMeta.totalPages, p + 1))}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-350 hover:bg-slate-850 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Task Form Modal for Admin Override edit */}
      {isFormOpen && (
        <TaskForm
          task={activeTask}
          onSubmit={handleEditTask}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
