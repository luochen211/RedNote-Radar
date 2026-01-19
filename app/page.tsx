import ParticleBackground from "./components/ParticleBackground";
import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";
import Framework from "./components/Framework";
import Methodology from "./components/Methodology";
import Modules from "./components/Modules";
import FooterLinks from "./components/FooterLinks";

export default function Page() {
  return (
    <div className="page page-enter">
      <ParticleBackground />

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
