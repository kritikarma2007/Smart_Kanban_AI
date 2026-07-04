import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthKey((prev) => prev + 1);
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-bg text-gray-100 flex flex-col">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#7c3aed]/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-[#8a2be2]/5 blur-[150px]" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {/* Main Layout Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar key={authKey} />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="w-full py-6 border-t border-white/5 bg-[#0b0914]/80 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4">
            &copy; {new Date().getFullYear()} Smart Kanban AI. Designed for  productivity.
          </div>
        </footer>
      </div>
    </div>
  );
}
