import { withAuth } from "next-auth/middleware";

// Gate app pages while never intercepting static/runtime assets.
export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const path = req.nextUrl.pathname;

            // Never block Next.js runtime/static requests.
            if (path.startsWith("/_next")) {
                return true;
            }

            // Allow the root path so users can see the login page
            if (path === "/") {
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
    // Exclude API, all _next assets, favicon, and direct file requests.
    matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
