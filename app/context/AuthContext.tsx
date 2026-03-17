'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { isAdminRole } from '@/lib/roles';

interface User {
    account: string;
    role: 'ADMIN' | 'USER';
    name: string;
    loginTime: string;
    id?: string;
}

interface AuthContextType {
    user: User | null;
    login: (account: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => false,
    logout: async () => { },
    isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const user: User | null = session?.user ? {
        account: session.user.name || "",
        role: isAdminRole((session.user as any).role) ? "ADMIN" : "USER",
        name: session.user.name || "",
        loginTime: new Date().toISOString(), // Mock, or from session if available
        id: (session.user as any).id,
    } : null;

    const login = async (account: string, password: string): Promise<boolean> => {
        const res = await signIn('credentials', {
            username: account,
            password: password,
            redirect: false,
        });

        return !!res?.ok;
    };

    const logout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading: status === 'loading' }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
