import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-background'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">M</span>
            </motion.div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              Mousaada
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors relative group"
            >
              Accueil
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <a
              href="#features"
              className="text-foreground hover:text-primary transition-colors relative group"
            >
              Fonctionnalités
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="text-foreground hover:text-primary transition-colors relative group"
            >
              Comment ça marche
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </a>

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              {isAuthenticated ? (
                <>
                  {user?.role === 'superadmin' || user?.role === 'admin' ? (
                    <Link to="/admin/dashboard">
                      <Button variant="secondary" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/dashboard">
                        <Button variant="ghost" size="sm">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {user?.name?.split(' ')[0]}
                    </Button>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-background border-b border-border rounded-lg mt-4 p-4 space-y-3"
          >
            <Link
              to="/"
              className="block text-foreground hover:text-primary p-2 rounded hover:bg-secondary transition"
            >
              Accueil
            </Link>
            <a
              href="#features"
              className="block text-foreground hover:text-primary p-2 rounded hover:bg-secondary transition"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              className="block text-foreground hover:text-primary p-2 rounded hover:bg-secondary transition"
            >
              Comment ça marche
            </a>

            {isAuthenticated ? (
              <>
                {user?.role !== 'superadmin' && user?.role !== 'admin' && (
                  <Link to="/dashboard" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/profile" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Profil
                  </Button>
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left p-2 text-destructive hover:bg-destructive/10 rounded transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button size="sm" className="w-full">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default ModernNavbar;
