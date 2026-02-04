"use client";

"use client";

import ParticleBackground from "./components/ParticleBackground";
import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import { useEffect } from "react";
import styles from "./login.module.css";

// Home shows only the auth experience: left context blurb + login card.
export default function Page() {
  // Prevent scrolling while on the login page (html + body)
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  return (
    <div className={`page-enter login-page no-scroll ${styles.screen}`}>
      <ParticleBackground />
      <main className="login-main" style={{ width: "100%" }}>
        <section id="login" className={`login-grid ${styles.grid}`}>
          <div className={`login-hero-desktop ${styles.heroWrap}`}>
            <Hero />
          </div>
          <div className={`login-card-wrap ${styles.cardWrap}`}>
            <LoginCard />
          </div>
        </section>
      </main>
    </div>
  );
}
