import React from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Call } from '../types';

interface IncomingCallModalProps {
  call: Call;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  call,
  onAccept,
  onReject,
}) => {
  return (
    <div id="incoming-call-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center"
      >
        <div className="relative mb-6 inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg mx-auto">
            {call.callerPhoto ? (
              <img src={call.callerPhoto} alt={call.callerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {call.callerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-full shadow-lg animate-bounce">
            {call.type === 'video' ? <Video className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{call.callerName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
          Incoming {call.type} call...
        </p>

        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onReject}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-100 dark:shadow-none transition-all"
          >
            <PhoneOff className="w-8 h-8" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAccept}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-100 dark:shadow-none transition-all animate-pulse"
          >
            <Phone className="w-8 h-8" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
