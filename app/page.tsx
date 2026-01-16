'use client';

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ParticleBackground from "./components/ParticleBackground";
import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import Framework from "./components/Framework";
import Methodology from "./components/Methodology";
import Modules from "./components/Modules";
import FooterLinks from "./components/FooterLinks";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`page ${mounted ? "mounted" : ""}`}>
      <ParticleBackground />

      <Navbar />

      <main>
        <section className="hero fade-up" id="login">
          <Hero />
          <LoginCard />
        </section>

        <Framework />
        <Methodology />
        <Modules />
        <FooterLinks />
      </main>
    </div>
  );
}
