import { User } from '@/type';
import { create } from 'zustand';
import { getCurrentUser } from '@/lib/appwrite';

type AuthStore = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({ isLoading: value }),

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true});

        try {
            const user = await getCurrentUser();
            if(user) set({ isAuthenticated: true, user: user as User });
            else set({ user: null, isAuthenticated: false })
        } catch(error) {
            console.log('Error fetching authenticated user:', error);
            set({ user: null, isAuthenticated: false});
        } finally {
            set({ isLoading: false});
        }
    }
}))

export default useAuthStore;