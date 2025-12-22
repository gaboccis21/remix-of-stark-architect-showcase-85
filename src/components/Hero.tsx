import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Music Notes Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Music className="w-8 h-8 text-primary-foreground/20" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-300">
          <Music className="w-6 h-6 text-primary-foreground/15" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse delay-500">
          <Music className="w-10 h-10 text-primary-foreground/10" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 reveal">
          <Music className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm text-primary-foreground/90">Educational Music Tool</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground text-architectural mb-6 reveal">
          Chord Validator
        </h1>
        
        <p className="text-2xl md:text-3xl text-primary-foreground/90 font-light mb-4 reveal-delayed">
          Validate Your Chord Progressions
        </p>
        
        <p className="text-lg md:text-xl text-primary-foreground/70 font-light tracking-wide max-w-2xl mx-auto mb-12 reveal-delayed">
          Powered by Nondeterministic Finite Automaton (NFA) technology
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-delayed">
          <Button 
            size="lg" 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6"
          >
            Try Validator Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6"
          >
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 reveal-delayed">
        <div className="w-px h-16 bg-primary-foreground/40" />
        <div className="text-minimal text-primary-foreground/60 mt-4 rotate-90 origin-center">
          SCROLL
        </div>
      </div>
    </section>
  );
};

export default Hero;
