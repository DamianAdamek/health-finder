import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ModeToggle } from '../ui/mode-toggle';
import { Button } from '@/components/ui/button';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-sm bg-background/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left Side: Logo with link to home */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className="text-lg sm:text-xl md:text-2xl">
              <a href="#">
                <span className="font-medium">Health</span>
                <span className="font-bold">Finder</span>
              </a>
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <Button variant="ghost">
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost">
              <a href="#how-it-works">How It Works</a>
            </Button>
            <Button variant="ghost">
              <a href="#for-professionals">For professionals</a>
            </Button>
          </div>

          {/* Right Side: Mode Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <ModeToggle />

            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>

            <Button className="hidden md:inline-flex" variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 border">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <a href="#features">Features</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <a href="#how-it-works">How It Works</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <a href="#for-professionals">For professionals</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
