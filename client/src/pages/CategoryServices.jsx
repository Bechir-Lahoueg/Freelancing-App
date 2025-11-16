import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { publicAxios } from '../utils/axios';
import { ArrowLeft, ArrowRight, Clock, DollarSign } from 'lucide-react';

const CategoryServices = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');

  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndServices();
    }
  }, [categoryId]);

  const fetchCategoryAndServices = async () => {
    try {
      console.log('🔍 Fetching category and services for categoryId:', categoryId);
      
      // Récupérer la catégorie (route publique)
      const categoryRes = await publicAxios.get(`/api/admin/categories/${categoryId}`);
      console.log('✅ Category fetched:', categoryRes.data);
      setCategory(categoryRes.data);

      // Récupérer les services de cette catégorie (route publique)
      const servicesRes = await publicAxios.get(`/api/services?categoryId=${categoryId}`);
      console.log('✅ Services fetched:', servicesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Erreur lors du chargement');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId) => {
    navigate(`/service-request?service=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
            >
              <ArrowLeft size={20} />
              Retour aux catégories
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-4xl shadow-lg">
                {category?.icon}
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">{category?.name}</h1>
                <p className="text-slate-400 text-lg">{category?.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          {services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aucun service disponible</h3>
              <p className="text-slate-400">Cette catégorie ne contient pas encore de services</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => handleServiceClick(service._id)}
                  className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer border border-slate-700 hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20"
                >
                  {/* Image si disponible */}
                  {service.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                        {service.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Info badges */}
                    <div className="space-y-2 mb-6">
                      {service.basePrice > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <DollarSign size={16} className="text-green-400" />
                          <span>À partir de <span className="text-green-400 font-semibold">{service.basePrice} DZD</span></span>
                        </div>
                      )}
                      {service.estimatedDuration && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock size={16} className="text-blue-400" />
                          <span>Durée estimée: <span className="text-blue-400 font-semibold">{service.estimatedDuration}</span></span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-xl font-semibold group-hover:shadow-lg transition"
                    >
                      Commander ce service
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>

                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-amber-500/5 group-hover:to-orange-500/10 transition-all duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryServices;
