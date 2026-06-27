import { Component as HorizonHero } from '../components/ui/horizon-hero-section';
import AuthSection from '../components/AuthSection';

export default function Landing() {
  return (
    <main>
      <HorizonHero>
        <AuthSection />
      </HorizonHero>
    </main>
  );
}
