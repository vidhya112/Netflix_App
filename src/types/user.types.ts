export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  jwtToken?: string | null;
}

export interface UserSession {
  id: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  createdAt: string;
  lastActive: string;
  isCurrentSession: boolean;
  status: "active" | "revoked";
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  activeProfile: string;
  sessions: UserSession[];
  jwtToken: string | null;
  authError: string | null;
}
