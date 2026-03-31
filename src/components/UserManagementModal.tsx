import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Trash2, Search, Mail, Calendar, User, Ban, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { USERS_COLLECTION } from '../constants';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { UserRole } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isOwner: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  isOwner,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    setLoading(true);
    const q = query(collection(db, USERS_COLLECTION), orderBy('lastSeen', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, isAdmin]);

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this user profile? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, USERS_COLLECTION, uid));
      toast.success("User profile deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user profile");
    }
  };

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, USERS_COLLECTION, uid), { role: newRole });
      toast.success(`User rank updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user rank");
    }
  };

  const handleToggleBan = async (uid: string, currentBannedStatus: boolean) => {
    try {
      await updateDoc(doc(db, USERS_COLLECTION, uid), { isBanned: !currentBannedStatus });
      toast.success(currentBannedStatus ? "User unbanned successfully" : "User banned successfully");
    } catch (error) {
      console.error("Error toggling ban:", error);
      toast.error("Failed to update ban status");
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
      case 'admin': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
      case 'friend': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400';
      case 'farzi': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div id="user-management-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-300"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-bold">Loading user database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold">No users found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.uid}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl hover:shadow-xl hover:shadow-indigo-50 dark:hover:shadow-black/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-gray-50 dark:border-gray-700">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-400 dark:text-indigo-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-gray-900 dark:text-white truncate">{user.displayName || 'Anonymous'}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-tighter ${getRoleBadgeColor(user.role)}`}>
                          {user.role || 'User'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{user.email || 'No email provided'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Last seen {user.lastSeen ? formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true }) : 'unknown'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {user.email !== "manasyadav547879@gmail.com" && (
                        <>
                          <select
                            value={user.role || 'user'}
                            disabled={!isOwner && user.role === 'admin'}
                            onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                            className="text-[10px] font-bold bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-gray-700 dark:text-gray-200 disabled:opacity-50"
                          >
                            <option value="user">User</option>
                            <option value="friend">Friend</option>
                            <option value="farzi">Farzi</option>
                            <option value="admin">Admin</option>
                            {isOwner && <option value="owner">Owner</option>}
                          </select>
                          
                          <div className="flex items-center gap-2 self-end">
                            <button
                              onClick={() => handleToggleBan(user.uid, !!user.isBanned)}
                              disabled={!isOwner && (user.role === 'admin' || user.role === 'owner')}
                              className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 ${
                                user.isBanned 
                                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100' 
                                  : 'text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                              }`}
                              title={user.isBanned ? "Unban User" : "Ban User"}
                            >
                              {user.isBanned ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUser(user.uid)}
                              disabled={!isOwner && (user.role === 'admin' || user.role === 'owner')}
                              className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                              title="Delete User Profile"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-[10px] font-mono text-gray-300 dark:text-gray-600 truncate max-w-[150px]">
                      ID: {user.uid}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${user.lastSeen && (Date.now() - user.lastSeen.toDate().getTime() < 5 * 60 * 1000) ? 'bg-green-500 animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        {user.lastSeen && (Date.now() - user.lastSeen.toDate().getTime() < 5 * 60 * 1000) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
            Total Users: {users.length}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-xs shadow-sm"
          >
            Close Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
