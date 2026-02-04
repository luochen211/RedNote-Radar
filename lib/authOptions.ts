import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

                console.log("Authorize called with:", { username: credentials.username, passwordLength: credentials.password?.length });

                let user;
                try {
                    console.log("Attempting to find user in DB...");
                    user = await prisma.user.findUnique({
                        where: { username: credentials.username }
                    });
                    console.log("User lookup result:", user ? `Found user ${user.id}` : "User not found");
                } catch (e) {
                    console.error("Prisma Error in authorize:", e);
                    return null;
                }

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                console.log("Password valid:", isPasswordValid);

                if (!isPasswordValid) {
                    return null;
                }

                // Log successful login
                /*
                // TODO: fix logging in authorize
                // Prisma usageLog requires explicit user connection or ID.
                // We have user.id here.
                // However, authorizing function shouldn't necessarily side-effect DB writes for logging in pure AuthJS philosophy, but it works.
                */
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
