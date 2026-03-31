import React, { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  signInAnonymously,
  logout, 
  onAuthStateChanged,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  where,
  getDocFromServer,
  Timestamp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from './firebase';
import { Toaster, toast } from 'sonner';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { ChatRoomList } from './components/ChatRoomList';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { AuthScreen } from './components/AuthScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { CallModal } from './components/CallModal';
import { ProfileModal } from './components/ProfileModal';
import { UserManagementModal } from './components/UserManagementModal';
import { UserList } from './components/UserList';
import { IncomingCallModal } from './components/IncomingCallModal';
import { ChatRoom, Message, UserProfile, Call, Friendship } from './types';
import { ROOMS_COLLECTION, MESSAGES_COLLECTION, USERS_COLLECTION, APP_NAME } from './constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  if (message.includes('permission-denied') || message.includes('insufficient permissions')) {
    toast.error(`Permission Denied: You don't have rights to ${operationType} at ${path}`);
  } else {
    toast.error(`Error: ${message}`);
  }
  
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [pendingRoomToJoin, setPendingRoomToJoin] = useState<ChatRoom | null>(null);
  const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(new Set());
  const [darkMode] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'room' | 'message' | 'user', id: string, roomId?: string } | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  // Listen for friendships
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friendships'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friendshipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
      setFriendships(friendshipsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'friendships');
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Friends Profiles Listener
  useEffect(() => {
    if (!user || friendships.length === 0) {
      setFriendsProfiles([]);
      return;
    }

    const relevantUserIds = Array.from(new Set(
      friendships
        .map(f => f.participants.find(p => p !== user.uid))
        .filter(Boolean) as string[]
    ));

    if (relevantUserIds.length === 0) {
      setFriendsProfiles([]);
      return;
    }

    // Firestore 'in' query is limited to 10 items.
    const q = query(
      collection(db, USERS_COLLECTION),
      where('uid', 'in', relevantUserIds.slice(0, 10))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => doc.data() as UserProfile);
      setFriendsProfiles(profiles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION));

    return () => unsubscribe();
  }, [user?.uid, friendships]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminEmail = "manasyadav547879@gmail.com";
        
        // Update user profile in Firestore
        try {
          const userDocRef = doc(db, USERS_COLLECTION, user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role = 'user';
          if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
            role = 'owner';
          } else if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            if (profile.isBanned) {
              setIsBanned(true);
              setUser(null);
              setLoading(false);
              return;
            }
            role = profile.role || 'user';
          }

          await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName || 'Guest',
            photoURL: user.photoURL,
            email: user.email,
            lastSeen: serverTimestamp(),
            role: role
          }, { merge: true });
          
          const currentIsOwner = role === 'owner' || user.email?.toLowerCase() === adminEmail.toLowerCase();
          setIsOwner(currentIsOwner);
          setIsAdmin(role === 'admin' || currentIsOwner);
          setUser(user);
          setIsBanned(false);
        } catch (error) {
          console.error("Error updating user profile:", error);
          // Fallback admin check
          const currentIsOwner = user.email?.toLowerCase() === adminEmail.toLowerCase();
          setIsOwner(currentIsOwner);
          setIsAdmin(currentIsOwner);
          setUser(user);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsOwner(false);
        setIsBanned(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // User Profile Listener (to get display name and photo from Firestore)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, USERS_COLLECTION, user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const profile = snapshot.data() as UserProfile;
        
        if (profile.isBanned) {
          setIsBanned(true);
          setUser(null);
          return;
        }

        setUser((prev: any) => ({ 
          ...prev, 
          displayName: profile.displayName,
          photoURL: profile.photoURL,
          role: profile.role
        }));
        const adminEmail = "manasyadav547879@gmail.com";
        const currentIsOwner = profile.role === 'owner' || user.email?.toLowerCase() === adminEmail.toLowerCase();
        setIsOwner(currentIsOwner);
        setIsAdmin(profile.role === 'admin' || currentIsOwner);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Call Listener (Incoming)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'ringing'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Call;
        setIncomingCall(callData);
        
        // Play ringtone (optional, but good for UX)
        // const audio = new Audio('/ringtone.mp3');
        // audio.play();
      } else {
        setIncomingCall(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'calls'));

    return () => unsubscribe();
  }, [user?.uid]);

  // Active Call Listener (to handle status changes like accepted/rejected)
  useEffect(() => {
    if (!activeCall) return;

    const unsubscribe = onSnapshot(doc(db, 'calls', activeCall.id), (snapshot) => {
      if (snapshot.exists()) {
        const callData = { id: snapshot.id, ...snapshot.data() } as Call;
        setActiveCall(callData);
        
        if (callData.status === 'accepted') {
          setIsCallOpen(true);
        } else if (callData.status === 'rejected' || callData.status === 'ended') {
          setActiveCall(null);
          setIsCallOpen(false);
          toast.info(`Call ${callData.status}`);
        }
      } else {
        setActiveCall(null);
        setIsCallOpen(false);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `calls/${activeCall.id}`));

    return () => unsubscribe();
  }, [activeCall?.id]);

  // Connection test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Rooms listener
  useEffect(() => {
    if (!user) return;

    setRoomsLoading(true);
    const q = query(collection(db, ROOMS_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      setRooms(roomsData);
      setRoomsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, ROOMS_COLLECTION);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Messages listener
  useEffect(() => {
    if (!user || !activeRoomId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    const q = query(
      collection(db, ROOMS_COLLECTION, activeRoomId, MESSAGES_COLLECTION),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
      setMessagesLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `${ROOMS_COLLECTION}/${activeRoomId}/${MESSAGES_COLLECTION}`);
    });

    return () => unsubscribe();
  }, [user?.uid, activeRoomId]);

  // Online users listener
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    
    // Force dark mode on body as well for good measure
    document.body.classList.add('dark');
    document.body.style.backgroundColor = '#111827'; // gray-900
  }, []);

  useEffect(() => {
    if (!user) return;

    setUsersLoading(true);
    // Simple online users logic: users active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(
      collection(db, USERS_COLLECTION),
      where('lastSeen', '>=', Timestamp.fromDate(fiveMinutesAgo)),
      orderBy('lastSeen', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setOnlineUsers(usersData);
      setUsersLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSendMessage = async (text: string, fileData?: { url: string, name: string, type: string, isImage: boolean }) => {
    if (!user || !activeRoomId) return;

    try {
      const messageData: any = {
        senderId: user.uid,
        senderName: user.displayName || 'Guest',
        senderPhoto: user.photoURL,
        senderRole: user.role || 'user',
        text,
        createdAt: serverTimestamp(),
        roomId: activeRoomId
      };

      if (fileData) {
        messageData.fileUrl = fileData.url;
        messageData.fileName = fileData.name;
        messageData.fileType = fileData.type;
        messageData.isImage = fileData.isImage;
      }

      await addDoc(collection(db, ROOMS_COLLECTION, activeRoomId, MESSAGES_COLLECTION), messageData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${ROOMS_COLLECTION}/${activeRoomId}/${MESSAGES_COLLECTION}`);
    }
  };

  const handleCreateRoom = async (name: string, description: string, password?: string) => {
    if (!user) return;
    setIsCreatingRoom(true);
    try {
      const roomData: any = {
        name,
        description,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        members: [user.uid]
      };
      if (password) {
        roomData.password = password;
      }
      const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomData);
      
      if (password) {
        setUnlockedRooms(prev => new Set([...prev, docRef.id]));
      }
      
      setActiveRoomId(docRef.id);
      setIsCreateRoomOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, ROOMS_COLLECTION);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleStartCall = async (type: 'voice' | 'video', receiverId: string, receiverName: string) => {
    if (!user) return;

    try {
      const roomId = `nexus-call-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const callData = {
        callerId: user.uid,
        callerName: user.displayName || 'User',
        callerPhoto: user.photoURL,
        receiverId,
        status: 'ringing',
        type,
        roomId,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'calls'), callData);
      setActiveCall({ id: docRef.id, ...callData } as Call);
      setIsCallOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calls');
    }
  };

  const handleAcceptCall = async (callId: string) => {
    try {
      await setDoc(doc(db, 'calls', callId), { status: 'accepted' }, { merge: true });
      const call = incomingCall || activeCall;
      if (call) {
        setActiveCall({ ...call, status: 'accepted' });
        setIsCallOpen(true);
      }
      setIncomingCall(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `calls/${callId}`);
    }
  };

  const handleRejectCall = async (callId: string) => {
    try {
      await setDoc(doc(db, 'calls', callId), { status: 'rejected' }, { merge: true });
      setIncomingCall(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `calls/${callId}`);
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    try {
      await setDoc(doc(db, 'calls', activeCall.id), { status: 'ended' }, { merge: true });
      setActiveCall(null);
      setIsCallOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `calls/${activeCall.id}`);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // If room has password and user hasn't unlocked it yet and isn't the creator/admin
    if (room.password && !unlockedRooms.has(roomId) && room.createdBy !== user.uid && !isAdmin) {
      setPendingRoomToJoin(room);
      setIsJoinRoomOpen(true);
    } else {
      setActiveRoomId(roomId);
    }
  };

  const handleJoinRoom = (password: string) => {
    if (!pendingRoomToJoin) return;

    if (pendingRoomToJoin.password === password) {
      setUnlockedRooms(prev => new Set([...prev, pendingRoomToJoin.id]));
      setActiveRoomId(pendingRoomToJoin.id);
      setIsJoinRoomOpen(false);
      setPendingRoomToJoin(null);
      toast.success("Room unlocked!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
      toast.success("Room deleted successfully");
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, ROOMS_COLLECTION);
    }
  };

  const handleDeleteMessage = async (roomId: string, messageId: string) => {
    if (!user || !activeRoomId) return;

    try {
      await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, MESSAGES_COLLECTION, messageId));
      toast.success("Message deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ROOMS_COLLECTION}/${roomId}/${MESSAGES_COLLECTION}`);
    }
  };

  const handleUpdateProfile = async (displayName: string, photoURL: string) => {
    if (!user) return;

    try {
      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        displayName,
        photoURL,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, USERS_COLLECTION);
    }
  };

  const handleSearchUsers = async (queryStr: string) => {
    setSearchQuery(queryStr);
    if (!queryStr.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, orderBy('displayName'));
      const snapshot = await getDocs(q); 
      
      const results = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile))
        .filter(u => 
          u.uid !== user?.uid && 
          u.displayName?.toLowerCase().includes(queryStr.toLowerCase())
        );
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    
    const existing = friendships.find(f => 
      (f.requesterId === user.uid && f.receiverId === receiverId) ||
      (f.requesterId === receiverId && f.receiverId === user.uid)
    );

    if (existing) {
      toast.error("Friend request already sent or you are already friends");
      return;
    }

    try {
      const friendshipId = `${user.uid}_${receiverId}`;
      await setDoc(doc(db, 'friendships', friendshipId), {
        id: friendshipId,
        requesterId: user.uid,
        receiverId: receiverId,
        participants: [user.uid, receiverId],
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success("Friend request sent!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
    }
  };

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    try {
      await setDoc(doc(db, 'friendships', friendshipId), {
        status: 'accepted'
      }, { merge: true });
      toast.success("Friend request accepted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendships/${friendshipId}`);
    }
  };

  const handleRejectFriendRequest = async (friendshipId: string) => {
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
      toast.success("Friend request rejected");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendships/${friendshipId}`);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignInAnonymously = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      toast.error("Guest sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create profile in Firestore
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`,
        email: email,
        lastSeen: serverTimestamp(),
        role: 'user'
      };
      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), newProfile);
    } catch (error: any) {
      console.error("Email sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setActiveRoomId(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSetName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !guestName.trim()) return;

    try {
      await handleUpdateProfile(guestName.trim(), user.photoURL || '');
    } catch (error) {
      console.error("Error setting name:", error);
    }
  };

  if (loading) return <LoadingScreen />;

  if (isBanned) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full">
          <ShieldCheck className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Account Banned</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-md">
          Your account has been suspended for violating our community guidelines. If you believe this is a mistake, please contact support.
        </p>
        <button 
          onClick={() => {
            setIsBanned(false);
            logout();
          }}
          className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
        >
          Go Back to Login
        </button>
      </div>
    );
  }

  if (!user) return (
    <AuthScreen 
      onSignIn={handleSignIn} 
      onSignInAnonymously={handleSignInAnonymously} 
      onEmailSignIn={handleEmailSignIn}
      onEmailSignUp={handleEmailSignUp}
      loading={loading} 
    />
  );

  // If user is logged in but has no display name (common for anonymous)
  // we show a simple name entry screen
  if (user && !user.displayName && !rooms.some(r => r.id === activeRoomId)) {
    return (
      <div className="min-h-screen bg-indigo-600 dark:bg-gray-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-2xl dark:shadow-black/40 max-w-md w-full text-center space-y-8 border border-gray-100 dark:border-gray-800"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">{APP_NAME}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Welcome! Please enter your name to start chatting.</p>
          </div>
          <form onSubmit={handleSetName} className="space-y-4">
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              Start Chatting
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <ErrorBoundary isAdmin={isAdmin}>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
        {isOwner && (
          <Navbar 
            user={user} 
            isAdmin={isAdmin}
            onSignOut={handleSignOut} 
            onOpenProfile={() => setIsProfileOpen(true)} 
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
          />
        )}
        
        <main className={`flex-1 flex overflow-hidden relative ${!isOwner ? 'pt-0' : ''}`}>
          {/* Room List - Hidden on mobile when a room is active */}
          <div className={`${activeRoomId ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-20 transition-colors duration-300`}>
            <ChatRoomList 
              rooms={rooms}
              onlineUsers={onlineUsers}
              activeRoomId={activeRoomId}
              onRoomSelect={handleRoomSelect}
              onCreateRoom={() => setIsCreateRoomOpen(true)}
              onDeleteRoom={handleDeleteRoom}
              onOpenProfile={() => setIsProfileOpen(true)}
              onSignOut={handleSignOut}
              currentUser={user}
              isAdmin={isAdmin}
              loading={roomsLoading}
              friendships={friendships}
              friendsProfiles={friendsProfiles}
              searchResults={searchResults}
              isSearching={isSearching}
              onSearchUsers={handleSearchUsers}
              onSendFriendRequest={handleSendFriendRequest}
              onAcceptFriendRequest={handleAcceptFriendRequest}
              onRejectFriendRequest={handleRejectFriendRequest}
            />
          </div>
          
          {/* Chat Window - Hidden on mobile when no room is active */}
          <div className={`${!activeRoomId ? 'hidden sm:flex' : 'flex'} flex-1 flex-col min-w-0 bg-white dark:bg-gray-900 z-10 transition-colors duration-300`}>
            {activeRoomId ? (
              <>
                <ChatWindow 
                  room={activeRoom}
                  messages={messages}
                  currentUser={user}
                  isAdmin={isAdmin}
                  onDeleteMessage={handleDeleteMessage}
                  loading={messagesLoading}
                  onBack={() => { setActiveRoomId(null); }} // Add back button for mobile
                />
                <MessageInput 
                  onSendMessage={handleSendMessage} 
                  disabled={!activeRoomId}
                  placeholder={`Message ${activeRoom ? '#' + activeRoom.name : 'chat'}`}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 transition-colors duration-300">Welcome to {APP_NAME}</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium transition-colors duration-300">Select a room from the sidebar to start chatting with others!</p>
              </div>
            )}
          </div>
          
          {isOwner && <UserList users={onlineUsers} loading={usersLoading} />}
        </main>
        
        <CreateRoomModal 
          isOpen={isCreateRoomOpen}
          onClose={() => setIsCreateRoomOpen(false)}
          onCreate={handleCreateRoom}
          loading={isCreatingRoom}
        />

        <JoinRoomModal
          isOpen={isJoinRoomOpen}
          onClose={() => setIsJoinRoomOpen(false)}
          onJoin={handleJoinRoom}
          roomName={pendingRoomToJoin?.name || ''}
        />

        <CallModal
          isOpen={isCallOpen}
          onClose={handleEndCall}
          roomName={activeCall?.roomId || ''}
          userName={user?.displayName || 'User'}
        />

        <AnimatePresence>
          {incomingCall && (
            <IncomingCallModal 
              call={incomingCall}
              onAccept={() => handleAcceptCall(incomingCall.id)}
              onReject={() => handleRejectCall(incomingCall.id)}
            />
          )}
        </AnimatePresence>

        <ProfileModal 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onSignOut={handleSignOut}
          onUpdateProfile={handleUpdateProfile}
        />

        <UserManagementModal 
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          isAdmin={isAdmin}
          isOwner={isOwner}
        />
        <Toaster position="top-right" richColors />
      </div>
    </ErrorBoundary>
  );
}
