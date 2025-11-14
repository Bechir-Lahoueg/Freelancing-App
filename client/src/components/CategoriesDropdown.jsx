import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoriesDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/categories/list`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition duration-300 font-semibold text-foreground group"
      >
        <span>Catégories</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-4 h-4 group-hover:text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-border/60 z-40"
          >
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>Aucune catégorie disponible</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4"
                >
                  {categories.map((category) => (
                    <motion.a
                      key={category._id}
                      href={`/tasks?category=${category.slug}`}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, translateX: 4 }}
                      className="group block p-3 rounded-lg hover:bg-gray-50 transition duration-200 border border-transparent hover:border-primary/30 cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="text-2xl flex-shrink-0"
                          style={{ filter: `hue-rotate(${Math.random() * 360}deg)` }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            )}

            {categories.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="border-t border-border/60 p-3"
              >
                <a
                  href="/services"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition duration-300 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Voir toutes les catégories
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesDropdown;
