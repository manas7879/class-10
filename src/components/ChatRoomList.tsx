import React, { useState } from 'react';
import { Plus, MessageSquare, Hash, Users, Trash2, LogOut, User as UserIcon, Settings, Lock, MessageCircle, Phone, Video, Search, UserPlus, Check, X, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatRoom, UserProfile, Friendship } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  onlineUsers: UserProfile[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  currentUser: any;
  isAdmin: boolean;
  loading: boolean;
  // New props
  friendships: Friendship[];
  friendsProfiles: UserProfile[];
  searchResults: UserProfile[];
  isSearching: boolean;
  onSearchUsers: (query: string) => void;
  onSendFriendRequest: (userId: string) => void;
  onAcceptFriendRequest: (friendshipId: string) => void;
  onRejectFriendRequest: (friendshipId: string) => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  rooms,
  onlineUsers,
  activeRoomId,
  onRoomSelect,
  onCreateRoom,
  onDeleteRoom,
  onOpenProfile,
  onSignOut,
  currentUser,
  isAdmin,
  loading,
  friendships,
  friendsProfiles,
  searchResults,
  isSearching,
  onSearchUsers,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchUsers(val);
  };

  const pendingRequests = friendships.filter(f => f.receiverId === currentUser?.uid && f.status === 'pending');
  const sentRequests = friendships.filter(f => f.requesterId === currentUser?.uid && f.status === 'pending');
  const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
  const friendIds = acceptedFriendships.map(f => f.participants.find(p => p !== currentUser?.uid));

  return (
    <div id="room-list" className="flex flex-col h-full w-full overflow-hidden transition-colors duration-300">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users by name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Rooms Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 transition-colors duration-300">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Rooms
        </h2>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateRoom}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            title="Create New Room"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Search Results</p>
            {isSearching ? (
              <div className="flex justify-center py-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <p className="px-3 text-xs text-gray-400 italic">No users found.</p>
            ) : (
              searchResults.map((user) => {
                const isFriend = friendIds.includes(user.uid);
                const isPending = sentRequests.some(r => r.receiverId === user.uid) || pendingRequests.some(r => r.requesterId === user.uid);
                
                return (
                  <div key={user.uid} className="w-full p-2 rounded-xl transition-all flex items-center gap-3 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-700 dark:text-gray-300 group">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold truncate">{user.displayName}</p>
                    </div>
                    {!isFriend && !isPending && (
                      <button
                        onClick={() => onSendFriendRequest(user.uid)}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                        title="Add Friend"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    {isPending && <span className="text-[10px] text-gray-400 italic">Pending</span>}
                    {isFriend && <UserCheck className="w-4 h-4 text-green-500" />}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Friend Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Friend Requests</p>
            {pendingRequests.map((req) => {
              const requester = friendsProfiles.find(u => u.uid === req.requesterId);
              
              return (
                <div key={req.id} className="w-full p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center gap-3 border border-indigo-100 dark:border-indigo-900/30">
                  <div className="relative flex-shrink-0">
                    <img
                      src={requester?.photoURL || `https://ui-avatars.com/api/?name=${requester?.displayName || 'User'}&background=random`}
                      alt={requester?.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{requester?.displayName || 'New User'}</p>
                    <p className="text-[9px] text-gray-500">wants to be friends</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAcceptFriendRequest(req.id)}
                      className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRejectFriendRequest(req.id)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Friends Section */}
        {friendsProfiles.length > 0 && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Friends</p>
            {friendsProfiles.map((friend) => {
              const isOnline = onlineUsers.some(u => u.uid === friend.uid);
              return (
                <div
                  key={friend.uid}
                  className="w-full p-2 rounded-xl transition-all flex items-center gap-3 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-700 dark:text-gray-300 group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName}&background=random`}
                      alt={friend.displayName || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      referrerPolicy="no-referrer"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold truncate">{friend.displayName}</p>
                    <p className="text-[9px] text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Public Rooms */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Public Channels</p>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rooms.length === 0 ? (
            <p className="px-3 text-xs text-gray-400 italic">No rooms found.</p>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ x: 4 }}
                className={`w-full p-2 rounded-xl transition-all flex items-center gap-2 group relative ${
                  activeRoomId === room.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-700 dark:text-gray-300'
                }`}
              >
                <button
                  onClick={() => onRoomSelect(room.id)}
                  className="flex-1 flex items-center gap-3 min-w-0 text-left"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activeRoomId === room.id ? 'bg-indigo-500' : 'bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50'
                  }`}>
                    <Hash className={`w-5 h-5 ${activeRoomId === room.id ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold truncate text-sm">{room.name}</p>
                      {room.password && (
                        <Lock className={`w-3 h-3 flex-shrink-0 ${activeRoomId === room.id ? 'text-white/70' : 'text-amber-500'}`} />
                      )}
                    </div>
                  </div>
                </button>

                {(isAdmin || room.createdBy === currentUser?.uid) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoom(room.id);
                    }}
                    className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      activeRoomId === room.id 
                        ? 'hover:bg-indigo-500 text-indigo-100 hover:text-white' 
                        : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                    }`}
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Online Users */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Online Users</p>
          {onlineUsers.filter(u => u.uid !== currentUser?.uid).length === 0 ? (
            <p className="px-3 text-xs text-gray-400 italic">No other users online.</p>
          ) : (
            onlineUsers.filter(u => u.uid !== currentUser?.uid).map((user) => (
              <div
                key={user.uid}
                className="w-full p-2 rounded-xl transition-all flex items-center gap-3 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-700 dark:text-gray-300 group"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=random`}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold truncate">{user.displayName}</p>
                  <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{user.role || 'User'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300 space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <Users className="w-4 h-4" />
          <span>{onlineUsers.length} Users Online</span>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center justify-between">
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-all flex-1 min-w-0 mr-2"
            >
              <div className="relative">
                <img
                  src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=random`}
                  alt={currentUser?.displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser?.displayName}</p>
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {currentUser?.role || 'User'}
                </p>
              </div>
            </button>
            <button
              onClick={onSignOut}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
