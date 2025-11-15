import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, ChevronDown } from 'lucide-react';

const CategoriesDropdown = ({ shouldShowWhiteStyle, isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/categories/list`);
      const data = await response.json();
      setCategories(data.slice(0, 6)); // Limit to 6 categories for dropdown
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/tasks?category=${categoryId}`);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleViewAll = () => {
    navigate('/categories');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (isMobile) {
    // Mobile version - simple list
    return (
      <div className="space-y-2">
        <button
          onClick={handleViewAll}
          className={`w-full px-4 py-3 flex items-center gap-3 font-semibold rounded-lg transition ${
            shouldShowWhiteStyle
              ? 'text-gray-800 hover:bg-gray-100'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <Grid size={18} />
          <span>Toutes les catégories</span>
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`w-full px-4 py-3 pl-11 flex items-center gap-3 rounded-lg transition ${
              shouldShowWhiteStyle
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-sm">{category.name}</span>
          </button>
        ))}
      </div>
    );
  }

  // Desktop version - dropdown
  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`flex items-center gap-2 font-semibold transition duration-300 group ${
          shouldShowWhiteStyle ? 'text-gray-800 hover:text-orange-600' : 'text-white hover:text-orange-300'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Grid size={20} className="group-hover:rotate-12 transition" />
        <span>Catégories</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onMouseLeave={() => setIsOpen(false)}
            className={`absolute top-full left-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden border ${
              shouldShowWhiteStyle
                ? 'bg-white border-gray-200'
                : 'bg-slate-900/95 backdrop-blur-xl border-slate-700'
            }`}
          >
            {/* Header */}
            <div className={`px-4 py-3 border-b ${
              shouldShowWhiteStyle ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <p className={`text-sm font-bold ${
                shouldShowWhiteStyle ? 'text-gray-800' : 'text-white'
              }`}>
                Nos Catégories
              </p>
            </div>

            {/* Categories List */}
            <div className="py-2 max-h-96 overflow-y-auto">
              {categories.map((category, index) => (
                <motion.button
                  key={category._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCategoryClick(category._id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition group ${
                    shouldShowWhiteStyle
                      ? 'hover:bg-orange-50 text-gray-700'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm group-hover:text-orange-600 transition ${
                      shouldShowWhiteStyle ? 'text-gray-800' : 'text-white'
                    }`}>
                      {category.name}
                    </p>
                    <p className={`text-xs line-clamp-1 ${
                      shouldShowWhiteStyle ? 'text-gray-500' : 'text-slate-500'
                    }`}>
                      {category.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer - View All */}
            <div className={`px-4 py-3 border-t ${
              shouldShowWhiteStyle ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <button
                onClick={handleViewAll}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm"
              >
                Voir toutes les catégories →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesDropdown;
