import { PenLine, Cpu, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: PenLine,
      title: "Input Chords",
      description: "Enter your chord progression using our intuitive interface. Type chord names directly or use the virtual keyboard."
    },
    {
      number: "02",
      icon: Cpu,
      title: "NFA Processing",
      description: "Our Nondeterministic Finite Automaton analyzes your sequence, checking against music theory rules and patterns."
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Get Feedback",
      description: "Receive instant validation results with detailed explanations about your chord progression's validity."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-minimal text-muted-foreground mb-4">PROCESS</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-architectural">
              How It Works
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full">
                    <ArrowRight className="w-8 h-8 text-border absolute left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                )}
                
                <div className="text-center">
                  {/* Step Number */}
                  <div className="text-7xl md:text-8xl font-bold text-muted/50 mb-4 group-hover:text-primary/20 transition-colors duration-300">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-2xl font-semibold mb-4">
                    {step.title}
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
