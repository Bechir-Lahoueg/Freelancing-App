import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const features = [
    {
      icon: '🎓',
      title: 'Aide Académique',
      description: 'Des experts prêts à vous aider dans tous vos projets universitaires'
    },
    {
      icon: '⚡',
      title: 'Rapide & Efficace',
      description: 'Obtenez de l\'aide rapidement avec des délais flexibles'
    },
    {
      icon: '💰',
      title: 'Prix Raisonnables',
      description: 'Tarifs adaptés aux budgets étudiants'
    },
    {
      icon: '🔒',
      title: 'Sécurisé',
      description: 'Vos données et paiements sont protégés'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Inscrivez-vous',
      description: 'Créez votre compte en quelques secondes'
    },
    {
      number: '02',
      title: 'Décrivez votre besoin',
      description: 'Choisissez le type de tâche et les options'
    },
    {
      number: '03',
      title: 'Recevez votre aide',
      description: 'Un expert prend en charge votre demande'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Étudiante en L3',
      text: 'Mousaada m\'a sauvé la vie pour mon projet de fin de semestre !'
    },
    {
      name: 'Karim B.',
      role: 'Étudiant en M1',
      text: 'Service rapide et de qualité. Je recommande vivement !'
    },
    {
      name: 'Amina Z.',
      role: 'Étudiante en L2',
      text: 'Prix abordables et travail professionnel. Parfait pour les étudiants !'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Besoin d'aide pour vos devoirs ?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto"
            >
              Connectez-vous avec des experts prêts à vous aider dans tous vos projets universitaires
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
              >
                Commencer maintenant
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition transform hover:scale-105"
              >
                Se connecter
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Mousaada ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour tous vos besoins académiques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trois étapes simples pour obtenir de l'aide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="text-6xl font-bold text-primary opacity-20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-primary"></div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary transition transform hover:scale-105 shadow-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des milliers d'étudiants nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-100 mb-8">
            Rejoignez des milliers d'étudiants qui réussissent avec Mousaada
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
          >
            S'inscrire gratuitement
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
