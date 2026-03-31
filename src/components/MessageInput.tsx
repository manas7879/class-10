import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (text: string, fileData?: { url: string, name: string, type: string, isImage: boolean }) => void;
  disabled: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled,
  placeholder = "Type a message...",
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    const fileRef = ref(storage, `chat_files/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || selectedFile) && !disabled && !isUploading) {
      setIsUploading(true);
      try {
        let fileData;
        if (selectedFile) {
          const url = await uploadFile(selectedFile);
          fileData = {
            url,
            name: selectedFile.name,
            type: selectedFile.type,
            isImage: selectedFile.type.startsWith('image/')
          };
        }
        onSendMessage(text.trim(), fileData);
        setText('');
        clearFile();
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(prev => prev + emojiData.emoji);
    // setShowEmojiPicker(false); // Keep open for multiple emojis
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div id="message-input-container" className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 relative transition-colors duration-300">
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs"
          >
            {filePreview ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={clearFile}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative">
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-4 z-50 w-full sm:w-auto">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              theme={document.documentElement.classList.contains('dark') ? 'dark' as any : 'light' as any}
              width="100%"
              height={400}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative flex items-end bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all overflow-hidden group">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isUploading}
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-4 resize-none max-h-32 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
            />
            <div className="flex items-center gap-1 p-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 transition-all rounded-lg ${showEmojiPicker ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                title="Attach File"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,application/pdf,text/*"
              />
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={(!text.trim() && !selectedFile) || disabled || isUploading}
            className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center min-w-[48px] ${
              (text.trim() || selectedFile) && !disabled && !isUploading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className={`w-5 h-5 ${(text.trim() || selectedFile) && !disabled ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
            )}
          </motion.button>
        </form>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">Enter</kbd> to send
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400">Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
};
