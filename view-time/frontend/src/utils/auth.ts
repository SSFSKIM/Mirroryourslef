import { create } from 'zustand';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { googleAuthScopes } from './firebaseConfig';
import { firebaseAuth } from 'app';  // Import from the app module instead of initializing a new one

interface AuthStore {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: AuthError | null;
  signInWithGoogle: () => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Set up auth state listener
  onAuthStateChanged(firebaseAuth, (user) => {
    set({ user, isInitialized: true, isLoading: false });
  });

  return {
    user: null,
    isInitialized: false,
    isLoading: false,
    error: null,
    
    signInWithGoogle: async () => {
      set({ isLoading: true, error: null });
      try {
        const provider = new GoogleAuthProvider();
        
        // Add YouTube Data API scope
        googleAuthScopes.forEach(scope => {
          provider.addScope(scope);
        });
        
        const result = await signInWithPopup(firebaseAuth, provider);
        set({ isLoading: false });
        return result;
      } catch (error) {
        set({ error: error as AuthError, isLoading: false });
        return null;
      }
    },
    
    signOut: async () => {
      set({ isLoading: true });
      try {
        await signOut(firebaseAuth);
        set({ isLoading: false });
      } catch (error) {
        set({ error: error as AuthError, isLoading: false });
      }
    }
  };
});
