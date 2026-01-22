import { Link } from "react-router-dom";
import { Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-black/5 dark:border-white/5 py-12 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Video className="w-5 h-5 text-black dark:text-white transition-colors duration-500" />
            <span className="text-lg font-semibold text-black dark:text-white transition-colors duration-500">Genvo</span>
          </Link>

          <div className="flex gap-8 text-black/60 dark:text-white/60 text-sm transition-colors duration-500">
            <Link to="/features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-black/40 dark:text-white/40 text-sm transition-colors duration-500">
            © 2026 Genvo
          </p>
        </div>
      </div>
    </footer>
  );
}