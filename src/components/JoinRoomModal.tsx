import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (password: string) => void;
  roomName: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  roomName,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onJoin(password.trim());
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="join-room-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-colors duration-300"
      >
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Protected Room</h2>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest">Password Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              The room <span className="font-bold text-gray-900 dark:text-white">#{roomName}</span> is password protected.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="join-password" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Enter Password
            </label>
            <div className="relative">
              <input
                id="join-password"
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Room password"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all text-sm shadow-md ${
                password.trim()
                  ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100 dark:shadow-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Join Room
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
