import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TestimonialsSection from '../components/TestimonialsSection';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const features = [
    {
      icon: '⚡',
      title: 'Ultra Rapide',
      description: 'Obtenez des réponses en quelques heures',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: '👨‍🎓',
      title: 'Experts Qualifiés',
      description: 'Des professionnels avec des années d\'expérience',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: '🔒',
      title: '100% Sécurisé',
      description: 'Vos données sont protégées et confidentielles',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: '💰',
      title: 'Prix Compétitifs',
      description: 'Tarifs justes et transparents sans frais cachés',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Étudiants satisfaits', icon: '👥' },
    { number: '5K+', label: 'Tâches complétées', icon: '✅' },
    { number: '50+', label: 'Experts disponibles', icon: '🎓' },
    { number: '99%', label: 'Taux de satisfaction', icon: '⭐' }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Étudiante en L3 Informatique',
      text: 'Do It m\'a aidé à finir mon projet en temps record. Le service est impeccable !',
      avatar: '👩‍🎓'
    },
    {
      name: 'Karim B.',
      role: 'Étudiant en M1 Gestion',
      text: 'Excellent service ! Les experts sont vraiment compétents et réactifs. Je recommande !',
      avatar: '👨‍🎓'
    },
    {
      name: 'Amina Z.',
      role: 'Étudiante en L2 Droit',
      text: 'Prix abordables et qualité garantie. Parfait pour les budgets étudiants !',
      avatar: '👩‍⚖️'
    },
    {
      name: 'Hassan K.',
      role: 'Étudiant en Doctorat',
      text: 'Les meilleures personnes pour vos travaux académiques. Vraiment satisfait !',
      avatar: '🧑‍🔬'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar />

      {/* Hero Section - Extraordinary Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-full opacity-20 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
            >
              Besoin d'aide
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                académique?
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connectez-vous avec nos experts qualifiés pour obtenir une aide professionnelle sur tous vos projets universitaires
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.button
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(168, 85, 247, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition duration-300 transform"
              >
                Commencer maintenant 🚀
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition duration-300"
              >
                Se connecter
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/20 transition duration-300"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Pourquoi choisir <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Do It</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour tous vos besoins académiques avec qualité garantie
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.color} group overflow-hidden cursor-pointer`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/90">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories/Services Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Nos Catégories de <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les services disponibles que nos experts peuvent vous proposer
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 bg-gray-100 rounded-2xl">
              <p className="text-xl text-gray-600">Aucune catégorie disponible pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">Vérifiez plus tard pour les nouvelles catégories</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => navigate(`/tasks?category=${category.slug}`)}
                  className="group cursor-pointer relative p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>

                  <div className="relative z-10">
                    {/* Image or Icon */}
                    <div className="mb-4 h-32 w-32 rounded-xl overflow-hidden bg-gray-100 group-hover:scale-110 transition duration-300">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full text-5xl">${category.icon}</div>`;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-5xl">
                          {category.icon}
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Button */}
                    <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition">
                      <span>Explorer</span>
                      <svg className="w-5 h-5 group-hover:translate-x-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Category color bar */}
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button
                onClick={() => navigate('/services')}
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                Voir toutes les catégories →
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Comment ça <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">marche</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              4 étapes simples pour obtenir l'aide que vous méritez
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { number: '01', title: 'Inscrivez-vous', description: 'Créez votre compte gratuitement en 30 secondes', icon: '📝' },
              { number: '02', title: 'Décrivez votre besoin', description: 'Expliquez clairement ce que vous avez besoin', icon: '✍️' },
              { number: '03', title: 'Choisissez votre expert', description: 'Sélectionnez le meilleur expert pour vous', icon: '👨‍💼' },
              { number: '04', title: 'Recevez votre aide', description: 'Obtenez votre travail complété à temps', icon: '✅' }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative text-center group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 group-hover:border-purple-500 transition">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-4xl font-black text-purple-600 mb-2">{step.number}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>

                  {index < 3 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Prêt à transformer vos études ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez les milliers d'étudiants qui réussissent grâce à Do It. Commencez dès maintenant !
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.button
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl transition duration-300 transform"
              >
                Commencer gratuitement 🚀
              </motion.button>
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/20 transition duration-300"
              >
                Se connecter
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Do It</h3>
              <p className="text-gray-400">La plateforme numéro 1 pour l'aide académique en ligne</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liens</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Accueil</a></li>
                <li><a href="#" className="hover:text-white transition">Services</a></li>
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Aide</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Do It. Tous les droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
