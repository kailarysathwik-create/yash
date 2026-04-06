import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, History, LogOut, Sparkles, Settings } from 'lucide-react';
import { tripAPI } from '../api/tripAPI';
import { toast } from 'sonner';
import { useUI } from '../context/UIContext';

const Taskbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isTaskbarSlid } = useUI();

  const handleLogout = async () => {
    try {
      await tripAPI.auth.logout();
      navigate('/login');
      toast.success('Logged out from Y.A.S.H');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { icon: Navigation, label: 'Plan', path: '/dashboard' },
    { icon: History, label: 'Archive', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-6 pointer-events-none">
      <nav 
        className="taskbar-glass flex items-center gap-2 p-2 px-4 border border-white/50 pointer-events-auto"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center justify-center p-4 rounded-full transition-all group ${
                isActive ? 'bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20' : 'text-[#1a0b2e]/60 hover:text-[#1a0b2e] hover:bg-white/40'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a0b2e] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="w-[1px] h-8 bg-[#1a0b2e]/10 mx-2" />

        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-4 rounded-full text-[#1a0b2e]/60 hover:text-red-500 hover:bg-red-50 group relative transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1a0b2e] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Sign Out
          </span>
        </button>
      </nav>
    </div>
  );
};

export default Taskbar;
