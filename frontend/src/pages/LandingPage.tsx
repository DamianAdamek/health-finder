import Hero from '../components/sections/Hero';
import Features from '../components/sections/Featues';
import HowItWorks from '@/components/sections/HowItWorks';
import ForProfessionals from '@/components/sections/ForProfessionals';

function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <ForProfessionals />
    </main>
  );
}

export default LandingPage;
