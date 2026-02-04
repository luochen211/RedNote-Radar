import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import SessionProvider from "./components/SessionProvider";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "Hotel Video InsightHub",
  description:
    "Video-based Social Media Marketing Analysis and Effectiveness Prediction for Hotel Icon and industry benchmarks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
  <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
  </head>
  <body>
    <SmoothScroll>
      <SessionProvider>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </SessionProvider>
    </SmoothScroll>
  </body>
</html>
);
}
