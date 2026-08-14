export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  activeProfile: string;
}
