import { Button } from "@/components/ui/button";
import { Music, Sparkles } from "lucide-react";
import logo from "@/assets/harmoniq-logo.png";
const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary dark:bg-background">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2338bdf8' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />
      
      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Music className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-300">
          <Sparkles className="w-6 h-6 text-accent/40" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse delay-500">
          <Music className="w-10 h-10 text-primary/20" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-20">
        {/* Logo */}
        <div className="mb-8 reveal">
          <img alt="HarmoniQ logo" decoding="async" className="w-40 h-40 md:w-52 md:h-52 mx-auto drop-shadow-2xl object-contain" src={logo} />
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white text-architectural mb-4 reveal">
          Harmon<span className="text-primary">iQ</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-primary font-medium mb-6 reveal-delayed">
          Automata-Driven Chord Validation
        </p>
        
        <p className="text-lg md:text-xl text-white/70 font-light tracking-wide max-w-2xl mx-auto mb-12 reveal-delayed">
          Validate your chord progressions using advanced Nondeterministic Finite Automaton (NFA) technology
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-delayed">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/30">
            Try Validator Now
          </Button>
          <Button size="lg" variant="outline" className="border-primary/50 text-white hover:bg-primary/10 text-lg px-8 py-6">
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 reveal-delayed">
        <div className="w-px h-16 bg-primary/40" />
        <div className="text-minimal text-primary/60 mt-4 rotate-90 origin-center">
          SCROLL
        </div>
      </div>
    </section>;
};
export default Hero;