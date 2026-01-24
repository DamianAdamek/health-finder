import { Copyright, Github } from 'lucide-react';

function Footer() {
  return (
    <footer className="left-0 w-full z-50 border-t backdrop-blur-sm bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Copyright Notice */}
          <div className="text-center sm:text-left">
            <span className="text-sm text-muted-foreground">
              <Copyright className="inline-block w-5 h-5 mr-1" />
              {new Date().getFullYear()} HealthFinder.
            </span>
          </div>

          {/* GitHub Link */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://github.com/DamianAdamek/health-finder.git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-blue-600"
              aria-label="View project on GitHub"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
