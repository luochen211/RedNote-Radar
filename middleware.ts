import { withAuth } from "next-auth/middleware";

// Gate everything except the root login screen and Next.js internals
export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // Allow the root path so users can see the login page
            if (req.nextUrl.pathname === "/") {
                return true;
            }

            // All other routes require an active session
            return !!token;
        },
    },
    pages: {
        signIn: "/",
    },
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
