/**
 * Robust Client-Side Persistent Authentication Service.
 * Decoupled from Firebase and utilizes localStorage to persist mock admin sessions safely.
 */

export interface MockUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'guest';
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
}

type AuthStateCallback = (user: MockUser | null) => void;

class MockAuth {
  private currentUserState: MockUser | null = null;
  private listeners = new Set<AuthStateCallback>();

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const savedUser = localStorage.getItem('azadi_mock_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        this.currentUserState = {
          ...parsed,
          getIdToken: async () => 'mock-jwt-token-' + Date.now()
        };
      } else {
        const hasLegacyAdmin = localStorage.getItem('azadi_admin_session') === 'true';
        if (hasLegacyAdmin) {
          this.currentUserState = {
            uid: 'admin-mock-uid',
            email: 'pavel4mutiara@gmail.com',
            emailVerified: true,
            displayName: 'Organization Admin',
            role: 'admin',
            getIdToken: async () => 'mock-jwt-token'
          };
          localStorage.setItem('azadi_mock_user', JSON.stringify(this.currentUserState));
        }
      }
    } catch {
      this.currentUserState = null;
    }
  }

  get currentUser(): MockUser | null {
    return this.currentUserState;
  }

  public onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentUserState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Custom Credentials Sign-In Support
   */
  public async signInWithCredentials(username?: string, password?: string): Promise<{ success: boolean; user?: MockUser; error?: string }> {
    if (!username || !password) {
      return { success: false, error: 'Username and password required.' };
    }
    const u = username.toLowerCase().trim();
    const p = password.trim();

    if (
      (u === 'admin' && p === 'azadi1988') || 
      (u === 'admin' && p === 'Milad2006') || 
      (u === 'pavel' && p === '01711975488')
    ) {
      const mockUser: MockUser = {
        uid: 'pavel4mutiara-uid',
        email: 'pavel4mutiara@gmail.com',
        emailVerified: true,
        displayName: 'Pavel Mutiara',
        photoURL: 'https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh',
        role: 'admin',
        getIdToken: async () => 'mock-jwt-token-admin'
      };
      this.currentUserState = mockUser;
      localStorage.setItem('azadi_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('azadi_admin_session', 'true');
      this.notifyListeners();
      return { success: true, user: mockUser };
    }

    return { success: false, error: 'Invalid username or password.' };
  }

  public async signInWithPopup(provider: any): Promise<{ user: MockUser }> {
    console.log("[Mock Auth] google popup authentication trigger:", provider);
    const mockUser: MockUser = {
      uid: 'pavel4mutiara-uid',
      email: 'pavel4mutiara@gmail.com',
      emailVerified: true,
      displayName: 'Pavel Mutiara',
      photoURL: 'https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh',
      role: 'admin',
      getIdToken: async () => 'mock-jwt-token-' + Date.now()
    };
    this.currentUserState = mockUser;
    localStorage.setItem('azadi_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('azadi_admin_session', 'true');
    this.notifyListeners();
    return { user: mockUser };
  }

  public async signOut(): Promise<void> {
    console.log("[Mock Auth] Session clean-up initiated.");
    this.currentUserState = null;
    localStorage.removeItem('azadi_mock_user');
    localStorage.removeItem('azadi_admin_session');
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUserState));
  }
}

export const authInstance = new MockAuth();

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
}

export const onAuthStateChanged = (auth: MockAuth, callback: AuthStateCallback) => {
  return auth.onAuthStateChanged(callback);
};

export const signInWithPopup = async (auth: MockAuth, provider: any) => {
  return auth.signInWithPopup(provider);
};

export const signOut = async (auth: MockAuth) => {
  return auth.signOut();
};
