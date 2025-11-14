import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CategoriesDropdown from './CategoriesDropdown';
import NotificationBell from './NotificationBell';
import { LogIn, UserPlus, Zap, Handshake, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Catégories', icon: Zap, onClick: () => { navigate('/categories'); setMobileMenuOpen(false); } },
    { label: 'Devenir Partenaire', icon: Handshake, onClick: () => { navigate('/partner'); setMobileMenuOpen(false); } },
    { label: 'Services', icon: Zap, onClick: () => { navigate('/services'); setMobileMenuOpen(false); } },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-90 transition"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/logo.png" alt="Do It" className="h-32 w-32 object-contain" />
          </motion.button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Categories Dropdown */}
            <div className="text-white">
              <CategoriesDropdown />
            </div>

            {/* Navigation Items */}
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-2 text-white font-semibold hover:text-cyan-100 transition duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={20} className="group-hover:rotate-12 transition" />
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
                  className="flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition duration-300 backdrop-blur-sm border border-white/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={18} />
                  Connexion
                </motion.button>
                <motion.button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                  whileHover={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus size={18} />
                  S'inscrire
                </motion.button>
              </>
            ) : (
              <>
                <NotificationBell />
                <div className="flex items-center gap-3 border-r border-white/30 pr-4">
                  <div className="text-right hidden lg:block">
                    <p className="font-bold text-sm text-white">{user.name}</p>
                    <p className="text-xs text-cyan-100 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate(user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition duration-300 backdrop-blur-sm border border-white/30 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition duration-300 font-semibold"
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
            className="md:hidden p-3 rounded-lg text-white hover:bg-white/20 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 bg-gradient-to-b from-blue-600 to-blue-700 border-t border-white/20">
            {/* Navigation Items for Mobile */}
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                onClick={item.onClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-white font-semibold hover:bg-white/20 rounded-lg transition"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </motion.button>
            ))}

            <div className="border-t border-white/20 my-2 pt-2"></div>

            {!user ? (
              <>
                <motion.button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-2 font-semibold hover:bg-white/20 rounded-lg transition text-white"
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
                  className="w-full px-4 py-3 flex items-center gap-2 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus size={18} />
                  S'inscrire
                </motion.button>
              </>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-white/20 mb-2">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-cyan-100 capitalize">{user.role}</p>
                </div>
                <motion.button
                  onClick={() => {
                    navigate(user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition font-semibold"
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
      </div>
    </nav>
  );
};

export default Navbar;
