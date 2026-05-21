import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Layers, Key, Mail, ShieldAlert, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const autofillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@primetrade.ai');
      setPassword('Admin@123');
    } else {
      setEmail('user@primetrade.ai');
      setPassword('User@123');
    }
    setError('');
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-md">

        {/* Left Column - Info / Hero (hidden on small screens) */}
        <div className="hidden w-1/2 flex-col justify-center bg-slate-950/80 p-10 md:flex relative overflow-hidden border-r border-slate-800">
          <div className="relative z-10">
            <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-4 shadow-lg shadow-cyan-500/20">
              <CheckSquare className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              Welcome to <span className="text-cyan-400">TaskFlow</span>
            </h2>
            <p className="text-slate-300 mb-6 leading-relaxed text-sm">
              <strong className="text-white">Primetrade TaskFlow</strong> is a robust, full-stack task management application designed for modern teams to streamline workflows and track priorities efficiently. Built with performance and security in mind.
            </p>

            <h3 className="text-base font-semibold text-cyan-400 mb-4 uppercase tracking-wider">Core Features & Usage</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 text-base text-slate-300">
                <ShieldAlert className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-1 text-base">Role-Based Access Control (RBAC)</strong>
                  <span className="text-sm text-slate-400 leading-relaxed block">Normal users manage their own tasks. Admin accounts have global access to view, edit, or delete any task across the system.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 text-base text-slate-300">
                <Zap className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-1 text-base">Secure JWT Authentication</strong>
                  <span className="text-sm text-slate-400 leading-relaxed block">Enterprise-grade security using HttpOnly cookies, JWT token rotation, and BCrypt password hashing to keep your data safe.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 text-base text-slate-300">
                <Layers className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-1 text-base">Comprehensive Task Management</strong>
                  <span className="text-sm text-slate-400 leading-relaxed block">Create, update, filter, and track tasks with priorities (Low to Urgent), status indicators, and specific due dates.</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"></div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sign In</h1>
            <p className="mt-1 text-sm text-slate-400">Authenticate to access your workspace</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs font-medium text-rose-300">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@primetrade.ai"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-650 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 disabled:opacity-50 transition-all mt-6 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts Panel */}
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center md:justify-start">
              <Zap className="h-3.5 w-3.5 text-cyan-500" />
              <span>Recruiter Quick Login</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => autofillCredentials('admin')}
                style={{ background: 'linear-gradient(to top right, #14b8a6, #0d9488)', border: 'none' }}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all text-center md:text-left cursor-pointer flex flex-col shadow-lg"
              >
                Autofill Admin
                <span className="block text-[9px] text-slate-100 font-mono mt-0.5">admin@primetrade.ai</span>
              </button>
              <button
                onClick={() => autofillCredentials('user')}
                style={{ background: 'linear-gradient(to top right, #14b8a6, #0d9488)', border: 'none' }}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all text-center md:text-left cursor-pointer flex flex-col shadow-lg"
              >
                Autofill User
                <span className="block text-[9px] text-slate-100 font-mono mt-0.5">user@primetrade.ai</span>
              </button>
            </div>
          </div>

          <p className="text-center md:text-left text-xs text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
