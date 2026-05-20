import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShieldCheck, LogOut, CheckSquare, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <div className="rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 shadow-lg shadow-cyan-500/20">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                Primetrade
              </span>
              <span className="text-[10px] uppercase font-semibold text-cyan-500 border border-cyan-500/30 px-1.5 py-0.5 rounded bg-cyan-950/30">
                TaskFlow
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive('/admin')
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-amber-300'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="h-6 w-[1px] bg-slate-800"></div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right hidden sm:flex">
                    <span className="text-sm font-semibold text-white">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono lowercase">{user.email}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/30 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive('/login') ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// Note: tailwind-like utility classes are defined as standard styles in our index.css design system
