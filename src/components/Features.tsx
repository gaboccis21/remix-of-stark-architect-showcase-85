import { Zap, GraduationCap, Cpu, Keyboard, Eye, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Validation",
      description: "Get instant feedback on your chord progressions as you type or input them."
    },
    {
      icon: GraduationCap,
      title: "Educational Focus",
      description: "Learn music theory concepts through interactive validation and detailed explanations."
    },
    {
      icon: Cpu,
      title: "NFA Technology",
      description: "Powered by Nondeterministic Finite Automaton for accurate pattern recognition."
    },
    {
      icon: Keyboard,
      title: "Multiple Input Methods",
      description: "Input chords via keyboard, virtual piano, or direct text entry for flexibility."
    },
    {
      icon: Eye,
      title: "Visual State Tracking",
      description: "Watch the NFA state machine process your chords in real-time visualization."
    },
    {
      icon: Target,
      title: "High Accuracy",
      description: "Reliable validation based on established music theory rules and patterns."
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-minimal text-muted-foreground mb-4">CAPABILITIES</h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-architectural">
              Key Features
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group bg-card hover:bg-accent/50 border-border hover:border-primary/20 transition-all duration-300 hover:shadow-elegant"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h4 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
