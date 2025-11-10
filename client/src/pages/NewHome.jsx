import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FuturisticNavbar from '../components/FuturisticNavbar';
import Footer from '../components/Footer';
import ThreeDBackground from '../components/ThreeDBackground';
import { Button } from '../components/ui/Button';
import {
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Smartphone,
  BookOpen,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
} from 'lucide-react';

const NewHome = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Aide Académique Complète',
      description: 'Des experts qualifiés pour tous vos besoins universitaires',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Performance Ultra-Rapide',
      description: 'Réponses en temps réel avec délais flexibles adaptés à vous',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Tarification Intelligente',
      description: 'Prix justes et transparents adaptés à votre budget étudiant',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Vos données et paiements protégés avec les meilleurs standards',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Communauté Active',
      description: 'Connectez-vous avec des milliers d\'étudiants et d\'experts',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Smartphone,
      title: 'Accès Partout',
      description: 'Plateforme responsive pour mobile, tablette et desktop',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en 30 secondes avec votre email ou réseaux sociaux',
      icon: Users,
    },
    {
      number: '02',
      title: 'Décrivez votre besoin',
      description: 'Détaillez votre tâche, le type d\'aide et vos préférences',
      icon: BookOpen,
    },
    {
      number: '03',
      title: 'Trouvez un expert',
      description: 'Nos algorithmes trouvent l\'expert idéal pour vous',
      icon: Zap,
    },
    {
      number: '04',
      title: 'Recevez votre aide',
      description: 'Obtenez une aide de qualité professionnelle garantie',
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Étudiante en L3 Informatique',
      text: 'Mousaada a complètement changé ma approche des études. Les experts sont vraiment compétents et disponibles !',
      avatar: 'SM',
    },
    {
      name: 'Karim B.',
      role: 'Étudiant en M1 Économie',
      text: 'Service rapide, professionnel et au prix juste. Je le recommande à tous mes camarades sans hésitation.',
      avatar: 'KB',
    },
    {
      name: 'Amina Z.',
      role: 'Étudiante en L2 Biologie',
      text: 'Enfin une plateforme où je peux trouver de l\'aide académique fiable et abordable. Parfait !',
      avatar: 'AZ',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <FuturisticNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <ThreeDBackground />

        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-8"
            >
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">
                Bienvenue dans le futur de l'aide académique
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Votre Succès
              </span>
              <br />
              <span className="text-white">Notre Mission</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Connectez-vous avec des experts académiques et transformez vos défis universitaires en opportunités de succès
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <Button size="lg" className="group relative overflow-hidden">
                  <motion.span
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    Commencer Maintenant
                    <ArrowRight size={20} />
                  </motion.span>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 hover:border-slate-400 text-white hover:bg-slate-900/50"
                >
                  Me Connecter
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-700/50"
            >
              <div>
                <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  5000+
                </p>
                <p className="text-slate-400 mt-2">Étudiants actifs</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  98%
                </p>
                <p className="text-slate-400 mt-2">Satisfaction client</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text">
                  &lt;2h
                </p>
                <p className="text-slate-400 mt-2">Temps moyen</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
            <motion.div className="w-1 h-2 bg-blue-400 rounded-full mt-2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pourquoi Mousaada ?
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Des fonctionnalités conçues pour vous réussir
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xl" />
                  <div className="relative p-8 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 bg-slate-800/30 backdrop-blur-sm">
                    <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-6`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Comment ça marche ?
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Quatre étapes simples pour obtenir l'aide dont vous avez besoin
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <div className="relative">
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-20 left-[60%] w-[140%] h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}

                    {/* Card */}
                    <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                      {/* Number badge */}
                      <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold">
                        {step.number}
                      </div>

                      <Icon className="w-12 h-12 text-blue-400 mb-6 mt-4" />
                      <h3 className="text-xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-400">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Ce que nos utilisateurs disent
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Rejoignez des milliers d'étudiants satisfaits
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white">{testimonial.name}</p>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">"{testimonial.text}"</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre parcours académique ?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Rejoignez nos milliers d'étudiants qui réussissent déjà avec Mousaada
            </p>
            <Link to="/register">
              <Button size="lg" className="group">
                <motion.span
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Rocket size={20} />
                  Démarrer Gratuitement
                  <ArrowRight size={20} />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewHome;
