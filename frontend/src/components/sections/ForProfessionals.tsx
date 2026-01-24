import { Calendar, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Calendar Management',
    description: 'Keep track of all your clients in one dashboard.',
    icon: Calendar,
  },
  {
    title: 'Growth Tools',
    description: 'Get discovered by hundreds of local clients.',
    icon: TrendingUp,
  },
  {
    title: 'Professional Badge',
    description: 'Get verified and stand out with a certified profile.',
    icon: ShieldCheck,
  },
];

function ForProfessionals() {
  return (
    <section id="for-professionals" className="py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">
          Designed for Fitness Professionals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="flex flex-col space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-4 bg-primary/10 text-primary rounded-lg">
                  <feature.icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Call to Action */}
          <div className="flex flex-col items-center text-center">
            <div className="w-100 h-48 bg-muted rounded-lg mb-8 flex items-center justify-center">
              <span className="text-muted-foreground">Image/Illustration</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="default" size="lg">
                  Join as a Professional
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Login to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForProfessionals;
