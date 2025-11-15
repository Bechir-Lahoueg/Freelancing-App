import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    entreprise: [
      { label: 'À propos', path: '/about' },
      { label: 'Services', path: '/services' },
      { label: 'Devenir Partenaire', path: '/partner' },
      { label: 'Blog', path: '/blog' },
    ],
    support: [
      { label: 'Centre d\'aide', path: '/help' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Conditions d\'utilisation', path: '/terms' },
      { label: 'Politique de confidentialité', path: '/privacy' },
    ],
    contact: [
      { icon: Mail, text: 'contact@doit.com', link: 'mailto:contact@doit.com' },
      { icon: Phone, text: '+216 XX XXX XXX', link: 'tel:+216XXXXXXXX' },
      { icon: MapPin, text: 'Tunis, Tunisie', link: null },
    ],
  };

  const socialLinks = [
    { icon: Facebook, link: 'https://facebook.com', color: 'hover:text-blue-500' },
    { icon: Twitter, link: 'https://twitter.com', color: 'hover:text-sky-400' },
    { icon: Instagram, link: 'https://instagram.com', color: 'hover:text-pink-500' },
    { icon: Linkedin, link: 'https://linkedin.com', color: 'hover:text-blue-600' },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <img 
                src="/logo.png" 
                alt="Do It Logo" 
                className="h-24 w-24 object-contain mb-4 hover:scale-110 transition-transform cursor-pointer"
                onClick={() => navigate('/')}
              />
              <p className="text-gray-400 text-sm leading-relaxed">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-bold">Do IT</span> est votre plateforme de freelancing moderne qui connecte talents et opportunités. Transformez vos idées en réalité.
              </p>
            </motion.div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${social.color} transition-all hover:bg-white/10 hover:border-white/20`}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Entreprise Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 relative inline-block">
              Entreprise
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 transition-all duration-300"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 relative inline-block">
              Support
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-orange-500 transition-all duration-300"></span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-bold text-lg mb-4 relative inline-block">
              Contact
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"></span>
            </h3>
            <ul className="space-y-4">
              {footerLinks.contact.map((contact, index) => (
                <li key={index}>
                  {contact.link ? (
                    <a
                      href={contact.link}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/30 transition-all">
                        <contact.icon size={16} />
                      </div>
                      <span>{contact.text}</span>
                    </a>
                  ) : (
                    <div className="text-gray-400 text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <contact.icon size={16} />
                      </div>
                      <span>{contact.text}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-2">
                Restez informé de nos actualités
              </h3>
              <p className="text-gray-400 text-sm">
                Inscrivez-vous à notre newsletter et recevez les dernières nouvelles et offres exclusives.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 md:w-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all whitespace-nowrap"
              >
                S'abonner
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p className="flex items-center gap-2">
              © {new Date().getFullYear()} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-bold">
                Do IT
              </span>
              . Tous droits réservés.
            </p>
            
            <p className="flex items-center gap-2">
              Fait avec <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> 
              <span className="text-gray-400">par</span>
              <span className="text-orange-400 font-semibold">l'équipe Do IT</span>
            </p>

            <div className="flex gap-6">
              <button
                onClick={() => navigate('/terms')}
                className="hover:text-orange-400 transition-colors"
              >
                Conditions
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="hover:text-orange-400 transition-colors"
              >
                Confidentialité
              </button>
              <button
                onClick={() => navigate('/cookies')}
                className="hover:text-orange-400 transition-colors"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient at the very bottom */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
    </footer>
  );
};

export default Footer;
