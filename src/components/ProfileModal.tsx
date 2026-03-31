import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, LogOut, Camera, Save, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSignOut: () => void;
  onUpdateProfile: (displayName: string, photoURL: string) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(displayName, photoURL);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="profile-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transition-colors duration-300"
      >
        <div className="relative h-32 bg-indigo-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <img
                src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`}
                alt={displayName}
                className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white dark:border-gray-900 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <div className="w-full space-y-4">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-700 dark:text-gray-200"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Photo URL</label>
                      <input
                        type="text"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-700 dark:text-gray-200"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{user.displayName || 'Guest'}</h2>
                        {user.role && user.role !== 'user' && (
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                            user.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                            user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' :
                            user.role === 'friend' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Member since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'recently'}</p>
                    </div>

                    <div className="w-full space-y-3 pt-2">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{user.email || 'Anonymous'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-900/50 shadow-sm"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isEditing && (
              <div className="w-full pt-4">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out of Nexus</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
