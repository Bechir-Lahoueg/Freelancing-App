import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/categories/list`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/services?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section with Video Background */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/vid2.mp4" type="video/mp4" />
          </video>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-amber-900/20" />
          
          {/* Animated Grid Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: videoLoaded ? 0.1 : 0 }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(251, 146, 60, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 146, 60, 0.1) 1px, transparent 1px)',
              backgroundSize: '100px 100px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-semibold text-xs tracking-wide">NOS SERVICES</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Découvrez Nos
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Catégories
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              Explorez notre gamme complète de services pour tous vos besoins académiques
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="relative py-20 bg-gradient-to-b from-slate-950 via-neutral-900 to-black">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.15) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
              />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-xl">Aucune catégorie disponible pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handleCategoryClick(category._id)}
                  className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer border border-slate-700 hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20"
                >
                  {/* Image Background */}
                  {category.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                        {category.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                        {category.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-orange-400 font-semibold group-hover:text-orange-300 transition-colors"
                      >
                        Explorer
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>

                      <div className="flex items-center gap-1 text-slate-500">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Populaire</span>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-amber-500/5 group-hover:to-orange-500/10 transition-all duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-20 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Prêt à <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">commencer</span> ?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Choisissez une catégorie et trouvez l'expert parfait pour votre projet
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition"
            >
              S'inscrire maintenant
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
