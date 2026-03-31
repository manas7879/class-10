import React from 'react';
import { UserProfile } from '../types';
import { User, Circle } from 'lucide-react';
import { motion } from 'motion/react';

interface UserListProps {
  users: UserProfile[];
  loading: boolean;
}

export const UserList: React.FC<UserListProps> = ({ users, loading }) => {
  return (
    <div id="user-list" className="hidden lg:flex flex-col h-full bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 w-64 overflow-hidden transition-colors duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Online Users
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 font-medium">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <User className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-xs text-gray-500 font-medium">No users online.</p>
          </div>
        ) : (
          users.map((user) => (
            <motion.div
              key={user.uid}
              whileHover={{ x: 4 }}
              className="w-full text-left p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="relative">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.displayName}</p>
                  {user.role && user.role !== 'user' && (
                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-full uppercase tracking-tighter ${
                      user.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' :
                      user.role === 'friend' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Online</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
          <span>{users.length} Active</span>
        </div>
      </div>
    </div>
  );
};
