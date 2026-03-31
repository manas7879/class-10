export type UserRole = 'owner' | 'admin' | 'friend' | 'farzi' | 'user';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  lastSeen: any; // Timestamp
  role?: UserRole;
  isBanned?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: any; // Timestamp
  members: string[]; // Array of UIDs
  password?: string; // Optional password for protected rooms
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  senderRole?: UserRole;
  text: string;
  createdAt: any; // Timestamp
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  isImage?: boolean;
}

export interface Call {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto: string | null;
  receiverId: string;
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  type: 'voice' | 'video';
  roomId: string; // Jitsi room name
  createdAt: any;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  participants: string[];
  status: 'pending' | 'accepted';
  createdAt: any;
}
