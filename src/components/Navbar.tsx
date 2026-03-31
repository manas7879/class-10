import React from 'react';
import { LogOut, MessageSquare, User, Shield, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME } from '../constants';

interface NavbarProps {
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
  onOpenProfile: () => void;
  onOpenUserManagement: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  isAdmin, 
  onSignOut, 
  onOpenProfile, 
  onOpenUserManagement 
}) => {
  return (
    <nav id="navbar" className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <MessageSquare className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{APP_NAME}</h1>
      </div>
      
      {user && (
        <div className="flex items-center gap-2 sm:gap-4">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenUserManagement}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
              title="User Management"
            >
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">Admin</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenProfile}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 pr-3 rounded-full transition-colors"
          >
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">{user.displayName}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </nav>
  );
};
