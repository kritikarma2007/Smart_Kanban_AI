import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Kanban, LogOut, User, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('smart_kanban_token');
  const username = localStorage.getItem('smart_kanban_user') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('smart_kanban_token');
    localStorage.removeItem('smart_kanban_user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b0914]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-accent p-0.5 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0b0914]">
                <Kanban className="h-4 w-4 text-brand-purple group-hover:text-brand-accent transition-colors" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-white via-purple-200 to-brand-purple bg-clip-text text-base sm:text-lg font-bold tracking-wider text-transparent">
              Smart Kanban <span className="hidden xs:inline text-brand-purple">AI</span>
            </span>
          </Link>

          {/* Action Links & Session Area */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* 👁️ DASHBOARD LINK: Hidden on mobile layouts, active on sm (tablet) and above */}
            <Link
              to="/dashboard"
              className={`hidden sm:relative sm:inline-flex px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                isActive('/dashboard') ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
              {isActive('/dashboard') && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                
                {/* 👤 Profile Badge: Text is fully visible on mobile now */}
                <div className="flex items-center space-x-1 sm:space-x-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/5 border border-white/10 max-w-[95px] xs:max-w-[120px] sm:max-w-none">
                  <User className="h-3.5 w-3.5 text-brand-purple flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs text-gray-300 font-medium truncate">
                    {username}
                  </span>
                </div>
                
                {/* 🚪 Logout Button: Text label stays inline on mobile viewports */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-1 sm:px-2 py-1.5 text-xs sm:text-sm font-medium text-gray-400 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[11px] sm:text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <Link
                  to="/login"
                  className={`flex items-center space-x-1 px-2 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    isActive('/login') ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>Login</span>
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center space-x-1 rounded-lg bg-brand-purple px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:bg-brand-accent transition-all duration-300"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}