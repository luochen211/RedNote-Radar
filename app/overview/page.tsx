'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/ParticleBackground";
import Framework from "../components/Framework";
import Methodology from "../components/Methodology";
import Modules from "../components/Modules";
import FooterLinks from "../components/FooterLinks";

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`page doc-home workspace-soft ${mounted ? "mounted" : ""}`}>
      <ParticleBackground />
      <Navbar />

      <main className="doc-main">
        <section className="doc-section-stack">
          <Framework />
          <Methodology />
          <Modules />
          <FooterLinks />
        </section>
      </main>
    </div>
  );
}
