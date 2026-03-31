import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME } from '../constants';

export const LoadingScreen: React.FC = () => {
  return (
    <div id="loading-screen" className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-indigo-600 p-6 rounded-3xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <MessageSquare className="text-white w-12 h-12" />
        </motion.div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
      </div>
      
      <div className="mt-10 text-center space-y-4">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{APP_NAME}</h1>
        <div className="flex items-center justify-center gap-1.5">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-indigo-600 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-indigo-600 rounded-full"
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">Connecting to servers...</p>
      </div>
    </div>
  );
};
