import React, { useEffect, useRef } from 'react';
import { X, Video, Mic, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  roomName,
  userName,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && jitsiContainerRef.current) {
      // Load Jitsi External API script
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        const domain = 'meet.jit.si';
        const options = {
          roomName: `NexusChat_${roomName.replace(/\s+/g, '_')}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false
          },
          interfaceConfigOverwrite: {
            // Customize UI if needed
          }
        };
        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI(domain, options);
        
        api.addEventListener('videoConferenceLeft', () => {
          onClose();
        });
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (jitsiContainerRef.current) {
          jitsiContainerRef.current.innerHTML = '';
        }
      };
    }
  }, [isOpen, roomName, userName, onClose]);

  if (!isOpen) return null;

  return (
    <div id="call-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 w-full h-full sm:max-w-5xl sm:h-[85vh] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-gray-800"
      >
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl animate-pulse">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Call: #{roomName}</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Secure Video & Audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 bg-black relative">
          <div ref={jitsiContainerRef} className="w-full h-full" />
          
          {/* Fallback/Loading state */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[-1]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold">Connecting to secure call server...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
