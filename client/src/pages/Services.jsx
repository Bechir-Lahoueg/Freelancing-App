import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { publicAxios } from '../utils/axios';
import { Package, Search, Filter, Sparkles, TrendingUp, Clock, DollarSign, User, Star, ArrowRight } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, selectedCategory, services]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Recuperer toutes les categories (route publique)
      const categoriesRes = await publicAxios.get('/api/admin/categories/list');
      setCategories(categoriesRes.data);

      // Recuperer tous les services (route publique)
      const servicesRes = await publicAxios.get('/api/services');
      setServices(servicesRes.data);
      setFilteredServices(servicesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filtrer par categorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category?._id === selectedCategory);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleServiceClick = (serviceId) => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/service-request-wizard?service=${serviceId}`);
      alert('Vous devez etre connecte pour postuler a un service');
      navigate('/login');
      return;
    }
    navigate(`/service-request-wizard?service=${serviceId}`);
  };

  // Compter les services par categorie
  const getServiceCountByCategory = (categoryId) => {
    return services.filter(s => s.category?._id === categoryId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <div className="pt-20 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.div 
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
              <span>Decouvrez nos services</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">
              Tous nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Services</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Explorez notre catalogue complet de services professionnels organises par categorie
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">{services.length}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Services disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-500">{categories.length}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Categories</div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 border border-white/10"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Toutes les categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id} className="bg-slate-900">
                      {cat.name} ({getServiceCountByCategory(cat._id)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                <span className="text-gray-400 text-xs sm:text-sm">Filtres actifs:</span>
                {searchTerm && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    &quot;{searchTerm}&quot;
                    <button onClick={() => setSearchTerm('')} className="hover:text-orange-300 text-base sm:text-lg">×</button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    {categories.find(c => c._id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-amber-300">×</button>
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="mb-6 text-gray-400 text-sm sm:text-base">
            {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouve{filteredServices.length > 1 ? 's' : ''}
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-20"
            >
              <Package size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">Aucun service trouve</h3>
              <p className="text-gray-500">Essayez de modifier vos criteres de recherche</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <div className="h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-orange-500/20"
                      onClick={() => handleServiceClick(service._id)}
                    >
                      {/* Image du service */}
                      {service.image && (
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                          <img 
                            src={service.image} 
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                          
                          {/* Category Badge sur l'image */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-orange-500/90 to-amber-500/90 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-orange-500/30">
                              {service.categoryId?.name || service.category?.name || 'Service'}
                            </span>
                          </div>

                          {/* Prix sur l'image */}
                          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                            <div className="px-2 py-1 sm:px-3 sm:py-2 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-orange-500/30">
                              <div className="flex items-center gap-0.5 sm:gap-1 text-orange-400">
                                <DollarSign size={16} className="text-green-500" />
                                <span className="text-base sm:text-lg font-bold text-white">{service.basePrice || service.price || 0}</span>
                                <span className="text-xs sm:text-sm">TND</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contenu de la carte */}
                      <div className="p-4 sm:p-6">
                        {/* Si pas d'image, afficher le badge normalement */}
                        {!service.image && (
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 rounded-full text-xs font-semibold border border-orange-500/30">
                              {service.categoryId?.name || service.category?.name || 'Non categorise'}
                            </span>
                            <TrendingUp size={16} className="text-green-500" />
                          </div>
                        )}

                        {/* Titre */}
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-orange-400 transition line-clamp-2">
                          {service.title || service.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                          {service.description}
                        </p>

                        {/* Infos */}
                        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-white/10">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                            <Clock size={14} className="text-orange-500 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{service.deliveryTime || service.estimatedDuration || 'À définir'}</span>
                          </div>
                          {!service.image && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <DollarSign size={14} className="text-green-500 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm font-semibold text-white">{service.basePrice || service.price || 0} TND</span>
                            </div>
                          )}
                        </div>

                      {/* Provider Info */}
                      {service.provider && (
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-white sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm text-white font-medium truncate">
                              {service.provider.firstName} {service.provider.lastName}
                            </p>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Star size={10} className="text-yellow-500 fill-yellow-500 sm:w-3 sm:h-3" />
                              <span className="text-[10px] sm:text-xs text-gray-400">4.8</span>
                            </div>
                          </div>
                        </div>
                        )}

                        {/* CTA Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceClick(service._id);
                          }}
                        >
                          <span>Postuler maintenant</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition sm:w-4 sm:h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Services;
