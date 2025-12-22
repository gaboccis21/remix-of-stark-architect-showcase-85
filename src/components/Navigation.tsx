import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Music } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Music className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg">Chord Validator</span>
        </a>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            Home
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            About
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            How It Works
          </a>
          <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
            Contact
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Button size="sm">
            Try Validator
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <a href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Home
            </a>
            <a href="#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              About
            </a>
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Features
            </a>
            <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              How It Works
            </a>
            <a href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
              Contact
            </a>
            
            {/* Mobile Actions */}
            <div className="pt-4 border-t border-border flex items-center gap-4">
              <ThemeToggle />
              <Button size="sm" className="flex-1">
                Try Validator
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
