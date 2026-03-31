import React, { useEffect, useRef } from 'react';
import { Message, UserProfile } from '../types';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Info, MessageCircle, User, Share2, Check, Trash2, FileText, ChevronLeft, Video, Phone } from 'lucide-react';

interface ChatWindowProps {
  room: any;
  messages: Message[];
  currentUser: any;
  isAdmin: boolean;
  onDeleteMessage: (roomId: string, messageId: string) => void;
  loading: boolean;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  messages,
  currentUser,
  isAdmin,
  onDeleteMessage,
  loading,
  onBack,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!room) {
    return (
      <div id="chat-empty" className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-8 text-center transition-colors duration-300">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Nexus Chat</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Select a room from the sidebar to start messaging or create your own community.
        </p>
      </div>
    );
  }

  return (
    <div id="chat-window" className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden relative transition-colors duration-300">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm z-10 transition-colors duration-300">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full sm:hidden transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex-shrink-0">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hidden sm:block">
              <Hash className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">{room.name}</h2>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px] sm:max-w-xs">{room.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  copied 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800' 
                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Invite'}</span>
              </motion.button>
              <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all">
                <Info className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-950/30 transition-colors duration-300"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fetching messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
              <MessageCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold">No messages yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Be the first to say hello in #{room.name}!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser?.uid;
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 ${!showAvatar ? 'opacity-0' : ''}`}>
                    {msg.senderPhoto ? (
                      <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                  </div>
                  
                    <div className={`group/msg relative flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">{isMe ? 'You' : msg.senderName}</span>
                          {msg.senderRole && (
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider shadow-sm ${
                              msg.senderRole === 'owner' ? 'bg-purple-600 text-white' :
                              msg.senderRole === 'admin' ? 'bg-indigo-600 text-white' :
                              msg.senderRole === 'friend' ? 'bg-pink-500 text-white' :
                              msg.senderRole === 'farzi' ? 'bg-orange-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {msg.senderRole}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                            {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 group">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                        }`}>
                          {msg.isImage && msg.fileUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-100/20 dark:border-gray-700/20 max-w-sm">
                              <img 
                                src={msg.fileUrl} 
                                alt={msg.fileName} 
                                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                                onClick={() => window.open(msg.fileUrl, '_blank')}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          {!msg.isImage && msg.fileUrl && (
                            <a 
                              href={msg.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all ${
                                isMe 
                                  ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                                  : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
                                <FileText className={`w-5 h-5 ${isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.fileName}</p>
                                <p className={`text-[10px] uppercase font-black tracking-widest ${isMe ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                                  {msg.fileType?.split('/')[1] || 'File'}
                                </p>
                              </div>
                            </a>
                          )}
                          {msg.text && (
                            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 dark:prose-invert">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {(isAdmin || msg.senderId === currentUser?.uid) && (
                          <button
                            onClick={() => onDeleteMessage(room.id, msg.id)}
                            className={`p-1.5 rounded-lg opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 ${isMe ? 'order-first' : ''}`}
                            title="Delete Message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
