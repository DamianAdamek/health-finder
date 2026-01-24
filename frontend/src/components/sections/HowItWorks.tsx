// const steps = [
//   {
//     title: 'Find',
//     description: 'Search for trainers and gyms near you using smart filters.',
//   },
//   {
//     title: 'Book',
//     description: 'Check availability and book your sessions in real-time.',
//   },
//   {
//     title: 'Train',
//     description: 'Show up and crush your workout with professional guidance.',
//   },
// ];

// function HowItWorks() {
//   return (
//     <section id="how-it-works" className="py-24 border-b">
//       <div className="w-max-4xl container mx-auto px-4">
//         <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">
//           Three steps to your fitness goal
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
//           {steps.map((step, index) => (
//             <div
//               key={index}
//               className="flex flex-col items-center text-center group"
//             >
//               <div className="mb-6 p-5 bg-primary/10 text-primary rounded-lg flex items-center justify-center w-16 h-16 text-2xl font-bold group-hover:bg-primary/20 transition">
//                 {index + 1}
//               </div>
//               <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
//               <p className="text-muted-foreground leading-relaxed">
//                 {step.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default HowItWorks;

import { Search, CalendarCheck, Dumbbell } from 'lucide-react';

const steps = [
  {
    title: 'Find',
    description: 'Search for trainers or gyms near you using smart filters.',
    icon: Search,
  },
  {
    title: 'Book',
    description:
      'Pick a date and book your session in seconds with real-time availability.',
    icon: CalendarCheck,
  },
  {
    title: 'Train',
    description: 'Show up and crush your workout with professional guidance.',
    icon: Dumbbell,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-b">
      <div className="max-w-6xl container mx-auto px-4">
        {/* Section Header */}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">
          Three steps to your fitness goal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Dashed line connecting the steps on medium+ screens */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-primary/20 -z-10" />

          {/* Dashed line connecting the steps on small screens */}
          <div className="md:hidden absolute left-1/2 top-1/4 bottom-1/4 w-0.5 border-l-2 border-dashed border-primary/20 -z-10" />

          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group relative bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Number inside a colored box with icon */}
              <div className="mb-6 relative">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <step.icon size={28} />
                </div>
                {/* Number badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary text-primary rounded-full flex items-center justify-center text-xs font-black">
                  {index + 1}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
