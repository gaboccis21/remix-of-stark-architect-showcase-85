import { Button } from "@/components/ui/button";
import { Music, Rocket } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 animate-pulse">
          <Music className="w-12 h-12 text-primary-foreground/10" />
        </div>
        <div className="absolute bottom-1/4 right-1/6 animate-pulse delay-500">
          <Music className="w-16 h-16 text-primary-foreground/10" />
        </div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8">
            <Rocket className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm text-primary-foreground/90">Get Started Today</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground text-architectural mb-6">
            Ready to Validate Your Music?
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-12 leading-relaxed">
            Start exploring chord progressions and enhance your music theory knowledge 
            with our powerful NFA-based validation tool.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-10 py-6 font-semibold"
            >
              Launch Validator
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-10 py-6"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
