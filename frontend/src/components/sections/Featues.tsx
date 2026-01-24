import {
  Target,
  Calendar,
  ShieldUser,
  MapPinned,
  Dumbbell,
  Building2,
} from 'lucide-react';

const features = [
  {
    title: 'Smart Matchmaking',
    description:
      'Find the perfect trainer based on your goals, localization and preferences.',
    icon: Target,
  },
  {
    title: 'Real-Time Booking',
    description:
      'Check live availability and book your next session in seconds. No more back-and-forth phone calls.',
    icon: Calendar,
  },
  {
    title: 'Verified Reviews',
    description:
      'Transparent rating system where only real clients can leave feedback for trainers and gyms.',
    icon: ShieldUser,
  },
  {
    title: 'Location-Based Search',
    description:
      'Discover gyms and trainers near you with our intuitive location-based search feature.',
    icon: MapPinned,
  },
  {
    title: 'For trainers',
    description:
      'Eliminate manual booking. Let clients see your real-time availability and book 24/7.',
    icon: Dumbbell,
  },
  {
    title: 'For gym owners',
    description:
      'Manage room capacity and schedules through a centralized dashboard.',
    icon: Building2,
  },
];

function Features() {
  return (
    <section id="features" className="py-24 min-h border-b">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            HealthFinder bridge the gap between clients, trainers, and
            facilities.
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border bg-card hover:shadow-md transform hover:-translate-y-1 transition-transform duration-200 group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
