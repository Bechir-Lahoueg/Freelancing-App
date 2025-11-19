import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { 
  LogIn, 
  UserPlus, 
  Handshake, 
  Briefcase, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard,
  LayoutGrid
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detecter scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detecter pages avec fond blanc
  const isWhiteBackgroundPage = 
    ['/login', '/register', '/dashboard', '/admin/dashboard', '/partner'].includes(location.pathname) || 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/admin');

  const shouldShowWhiteStyle = isWhiteBackgroundPage || scrolled;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Navigation items (Catégories -> Services -> Devenir Partner)
  const navItems = [
    { 
      label: 'Catégories', 
      icon: LayoutGrid, 
      onClick: () => { 
        navigate('/categories'); 
        setMobileMenuOpen(false); 
      } 
    },
    { 
      label: 'Services', 
      icon: Briefcase, 
      onClick: () => { 
        navigate('/services'); 
        setMobileMenuOpen(false); 
      } 
    },
    { 
      label: 'Devenir Partenaire', 
      icon: Handshake, 
      onClick: () => { 
        navigate('/partner'); 
        setMobileMenuOpen(false); 
      } 
    }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        shouldShowWhiteStyle
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200' 
          : 'bg-transparent backdrop-blur-sm border-b border-white/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-90 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/logo.png" 
              alt="Do It" 
              className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain" 
            />
          </motion.button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className={`flex items-center gap-2 font-semibold transition duration-300 ${
                  shouldShowWhiteStyle 
                    ? 'text-gray-800 hover:text-orange-600' 
                    : 'text-white hover:text-orange-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <motion.button
                  onClick={() => navigate('/login')}
                  className={`flex items-center gap-2 px-5 py-2.5 font-semibold rounded-full transition duration-300 backdrop-blur-sm border ${
                    shouldShowWhiteStyle
                      ? 'text-gray-800 bg-gray-100 hover:bg-gray-200 border-gray-300' 
                      : 'text-white bg-white/10 hover:bg-white/20 border-white/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={18} />
                  Connexion
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full hover:shadow-xl transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus size={18} />
                  S'inscrire
                </motion.button>
              </>
            ) : (
              <>
                <NotificationBell scrolled={shouldShowWhiteStyle} />
                
                <motion.button
                  onClick={() => navigate(user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition duration-300 backdrop-blur-sm border font-semibold ${
                    shouldShowWhiteStyle
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300' 
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </motion.button>
                
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition duration-300 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} />
                  Déconnexion
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-3 rounded-full transition ${
              shouldShowWhiteStyle
                ? 'text-gray-800 hover:bg-gray-100' 
                : 'text-white hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className={`py-4 space-y-2 border-t ${
                shouldShowWhiteStyle
                  ? 'bg-white border-gray-200' 
                  : 'bg-white/10 backdrop-blur-xl border-white/20'
              }`}>
                {/* Navigation Items */}
                {navItems.map((item) => (
                  <motion.button
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full px-4 py-3 flex items-center gap-3 font-semibold rounded-lg transition ${
                      shouldShowWhiteStyle
                        ? 'text-gray-800 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </motion.button>
                ))}

                <div className={`border-t my-2 ${shouldShowWhiteStyle ? 'border-gray-200' : 'border-white/20'}`} />

                {/* Auth Buttons Mobile */}
                {!user ? (
                  <>
                    <motion.button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-2 font-semibold rounded-lg transition ${
                        shouldShowWhiteStyle
                          ? 'text-gray-800 hover:bg-gray-100' 
                          : 'text-white hover:bg-white/20'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogIn size={18} />
                      Connexion
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus size={18} />
                      S'inscrire
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={() => {
                        navigate(user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-2 rounded-lg transition font-semibold ${
                        shouldShowWhiteStyle
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </motion.button>
                    
                    <motion.button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;