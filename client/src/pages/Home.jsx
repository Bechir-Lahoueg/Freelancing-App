import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import TestimonialsSection from '../components/TestimonialsSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, Shield, DollarSign, Users, CheckCircle2, ArrowRight, TrendingUp, Award, Clock, Target } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

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
      icon: Zap,
      title: 'Réponse Ultra-Rapide',
      description: 'Obtenez de l\'aide en quelques heures, pas en jours',
      color: 'from-yellow-400 to-orange-500',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: Users,
      title: 'Experts Certifiés',
      description: 'Plus de 10 professionnels qualifiés à votre service',
      color: 'from-blue-400 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
    },
    {
      icon: Shield,
      title: 'Sécurité Garantie',
      description: 'Vos données protégées avec cryptage de niveau bancaire',
      color: 'from-green-400 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
    },
    {
      icon: DollarSign,
      title: 'Prix Transparents',
      description: 'Tarifs clairs et compétitifs sans frais cachés',
      color: 'from-purple-400 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Étudiants satisfaits', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { number: '5K+', label: 'Projets réalisés', icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
    { number: '50+', label: 'Experts qualifiés', icon: Award, color: 'from-purple-500 to-pink-500' },
    { number: '99%', label: 'Taux de réussite', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Inscription Rapide',
      description: 'Créez votre compte en 30 secondes',
      icon: Target,
      delay: 0.2
    },
    {
      number: '02',
      title: 'Décrivez Votre Besoin',
      description: 'Expliquez votre projet en détail',
      icon: Clock,
      delay: 0.4
    },
    {
      number: '03',
      title: 'Trouvez un Expert',
      description: 'Choisissez parmi nos professionnels',
      icon: Users,
      delay: 0.6
    },
    {
      number: '04',
      title: 'Recevez Votre Travail',
      description: 'Obtenez des résultats de qualité',
      icon: CheckCircle2,
      delay: 0.8
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
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section with Video Background */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
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
            <source src="/hatha.mp4" type="video/mp4" />
          </video>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-neutral-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-amber-900/20" />
          
          {/* Animated Grid Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: videoLoaded ? 0.15 : 0 }}
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(251, 146, 60, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 146, 60, 0.1) 1px, transparent 1px)',
              backgroundSize: '100px 100px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="flex items-center justify-center">
            {/* Centered Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl"
            >
              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Réussissez
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Brillamment
                </span>
                <br />
                vos études
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Connectez-vous avec des <span className="text-orange-400 font-semibold">experts qualifiés</span> et obtenez l'aide dont vous avez besoin pour exceller dans vos projets académiques.
              </p>

              {/* CTA Buttons - Cachés si utilisateur connecté */}
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={() => navigate('/register')}
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(251, 146, 60, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg overflow-hidden shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Commencer maintenant
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-amber-700 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-white/40 backdrop-blur-xl text-white rounded-xl font-bold text-lg hover:border-orange-400 transition-all duration-300"
                  >
                    Se connecter
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.15) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-full mb-4"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-semibold text-xs tracking-wide">POURQUOI NOUS CHOISIR</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Une expérience <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">exceptionnelle</span>
            </h2>
            <p className="text-base text-gray-400 max-w-3xl mx-auto">
              Des fonctionnalités pensées pour votre réussite académique
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 ${feature.gradient} rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative h-full bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300">
                  <div className="relative mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className={`absolute inset-0 w-12 h-12 bg-gradient-to-br ${feature.color} opacity-20 blur-xl rounded-xl`}
                    />
                    <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500 rounded-b-2xl`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-20 bg-gradient-to-b from-black via-orange-950/20 to-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Nos Catégories de <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              Découvrez tous les services disponibles que nos experts peuvent vous proposer
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin">
                <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => navigate(`/services?category=${category._id}`)}
                  className="group cursor-pointer relative p-6 rounded-xl bg-neutral-900/80 backdrop-blur-sm border-2 border-neutral-700 hover:border-orange-500 hover:shadow-2xl transition duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>

                  <div className="relative z-10">
                    {/* Image or Icon */}
                    <div className="mb-3 h-24 w-24 rounded-lg overflow-hidden bg-neutral-800 group-hover:scale-110 transition duration-300">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full text-4xl">${category.icon}</div>`;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-4xl">
                          {category.icon}
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Button */}
                    <div className="flex items-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition text-sm">
                      <span>Explorer</span>
                      <svg className="w-4 h-4 group-hover:translate-x-2 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="text-center mt-10"
            >
              <button
                onClick={() => navigate('/services')}
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold text-base hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                Voir toutes les catégories →
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Comment ça <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">marche</span> ?
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              4 étapes simples pour obtenir l'aide que vous méritez
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
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
                whileHover={{ scale: 1.03 }}
                className="relative text-center group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>
                <div className="bg-neutral-900/60 backdrop-blur-sm p-5 rounded-xl border-2 border-neutral-700 group-hover:border-orange-500 transition">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="text-2xl font-black text-orange-500 mb-1">{step.number}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-400">{step.description}</p>

                  {index < 3 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-16 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 relative overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Prêt à transformer vos études ?
            </h2>
            <p className="text-base text-white/90 mb-6 max-w-2xl mx-auto">
              Rejoignez les milliers d'étudiants qui réussissent grâce à Do It. Commencez dès maintenant !
            </p>
            {/* CTA Buttons - Cachés si utilisateur connecté */}
            {!user && (
              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.button
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-base hover:shadow-2xl transition duration-300 transform"
                >
                  Commencer gratuitement 🚀
                </motion.button>
                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border-2 border-white text-white rounded-xl font-bold text-base hover:bg-white/20 transition duration-300"
                >
                  Se connecter
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-bold mb-3">Do It</h3>
              <p className="text-gray-400 text-sm">La plateforme numéro 1 pour l'aide académique en ligne</p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Liens</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Accueil</a></li>
                <li><a href="#" className="hover:text-white transition">Services</a></li>
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Support</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Aide</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-sm">Légal</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Do It. Tous les droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
