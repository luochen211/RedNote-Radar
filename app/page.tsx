import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LoginCard from "./components/LoginCard";

export default function Page() {
  return (
    <div className="page landing-home">
      <Navbar />

      <main className="landing-main">
        <section className="hero landing-hero" id="login">
          <div className="landing-hero-copy">
            <Hero />
          </div>
          <aside className="landing-hero-login">
            <LoginCard />
          </aside>
        </section>
      </main>
    </div>
  );
}
