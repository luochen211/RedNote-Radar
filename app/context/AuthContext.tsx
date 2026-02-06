'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

interface User {
    account: string;
    role: 'admin' | 'user';
    name: string;
    loginTime: string;
    id?: string;
}

interface AuthContextType {
    user: User | null;
    login: (account: string, password: string) => Promise<{ ok: boolean; role?: 'admin' | 'user' }>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => ({ ok: false }),
    logout: async () => { },
    isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const user: User | null = session?.user
        ? {
            account: session.user.name || "",
            role: (((session.user as any).role || "user") as string).toLowerCase() as 'admin' | 'user',
            name: session.user.name || "",
            loginTime: new Date().toISOString(), // Mock, or from session if available
            id: (session.user as any).id,
        }
        : null;

    const login = async (account: string, password: string): Promise<{ ok: boolean; role?: 'admin' | 'user' }> => {
        const res = await signIn('credentials', {
            username: account,
            password: password,
            redirect: false,
        });

        if (!res?.ok) {
            return { ok: false };
        }

        try {
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();
            const role = (((sessionData?.user as any)?.role || 'USER') as string).toLowerCase() as 'admin' | 'user';
            return { ok: true, role };
        } catch {
            return { ok: true };
        }
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
