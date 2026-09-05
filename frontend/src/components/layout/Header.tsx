import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  LogOut,
  ChevronDown,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { UserRole } from '../../types';
import logoImg from '../../assets/logo.png';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const safeRole = role || 'trainee';
  const { notifications, unreadCount, markNotificationAsRead, searchQuery, setSearchQuery, sidebarOpen, setSidebarOpen, theme, toggleTheme, showToast } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleIcons = {
    trainee: <GraduationCap className="h-4 w-4 text-cyan-400" />,
    trainer: <BookOpen className="h-4 w-4 text-emerald-400" />,
    admin: <Shield className="h-4 w-4 text-purple-400" />
  };
  
  const roleColors = {
    trainee: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    trainer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  };



  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md lg:px-6">
      {/* Left: Mobile Toggle & Prominent Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Large Prominent Transparent Brand Logo */}
        <img
          src={logoImg}
          alt="CAPACITY CONNECT"
          className="h-14 md:h-16 w-auto max-w-[280px] md:max-w-[360px] object-contain cursor-pointer transition-transform hover:scale-105"
        />
      </div>

      {/* Center: Search & Role Quick Switcher */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-6">
        {/* Global Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, competencies, trainers, assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>


      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Light / Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline text-amber-300">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline text-indigo-600">Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Notifications</span>
                <span className="text-[10px] text-cyan-400">{unreadCount} new</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`cursor-pointer rounded-lg p-2 text-xs transition-colors border ${
                      n.read ? 'bg-slate-950/40 border-transparent text-slate-400' : 'bg-slate-800/60 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-tight text-slate-300">{n.message}</p>
                    <span className="mt-1 block text-[9px] text-slate-500">{n.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-800/60 transition-colors border border-slate-800"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-500/50"
            />
            <div className="hidden text-xs lg:block">
              <div className="font-semibold text-white truncate max-w-[120px]">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                <div className={`mt-1.5 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${roleColors[safeRole]}`}>
                  {roleIcons[safeRole]}
                  <span>{safeRole}</span>
                </div>
              </div>

              {/* Theme switch in profile dropdown */}
              <div className="p-2 border-b border-slate-800">
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                    <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                  </span>
                </button>
              </div>



              <button
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
