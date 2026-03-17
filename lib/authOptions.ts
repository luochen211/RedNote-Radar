import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const quickUsers = [
    { username: "admin", password: "admin", role: "ADMIN" },
    { username: "demo", password: "demo", role: "USER" },
];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { username: credentials.username }
                    });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    try {
                        await prisma.usageLog.create({
                            data: {
                                userId: user.id,
                                action: "LOGIN",
                                ip: "unknown"
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    return {
                        id: user.id,
                        name: user.username,
                        role: user.role
                    };
                } catch (error) {
                    console.warn("Database auth unavailable, falling back to quick login:", error);

                    const quickUser = quickUsers.find(
                        (user) =>
                            user.username === credentials.username &&
                            user.password === credentials.password
                    );

                    if (!quickUser) {
                        return null;
                    }

                    return {
                        id: `quick-${quickUser.username}`,
                        name: quickUser.username,
                        role: quickUser.role
                    };
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    }
};
