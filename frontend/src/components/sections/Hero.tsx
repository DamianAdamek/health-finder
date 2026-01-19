import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-4 text-center border-b">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Your Perfect Workout, Simplified.
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Discover and book top trainers and gyms effortlessly with
          HealthFinder.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-base"
            >
              Get Started
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 h-12 text-base"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
