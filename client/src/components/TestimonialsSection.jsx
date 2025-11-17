import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function TestimonialsSection() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `https://freelancing-app-mdgw.onrender.com/api/comments/public`
        );
        const commentsList = Array.isArray(response.data) ? response.data : [];
        setComments(commentsList);
      } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    const commentsList = Array.isArray(comments) ? comments : [];
    if (commentsList.length > 0) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [comments, currentIndex]);

  const handleNext = () => {
    const commentsList = Array.isArray(comments) ? comments : [];
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % commentsList.length);
  };

  const handlePrev = () => {
    const commentsList = Array.isArray(comments) ? comments : [];
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + commentsList.length) % commentsList.length);
  };

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-b from-black via-neutral-950 to-black flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const commentsList = Array.isArray(comments) ? comments : [];

  if (commentsList.length === 0) {
    return null;
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const currentComment = commentsList[currentIndex];

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-neutral-950 via-black to-neutral-950">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.1) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Orbs */}
      <motion.div
        animate={{ 
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-semibold text-xs tracking-wide">CE QUE DISENT NOS ÉTUDIANTS</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Des milliers d'<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">étudiants</span> satisfaits
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Découvrez les témoignages authentiques de notre communauté
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-3xl mx-auto">
          {/* Navigation Buttons */}
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-20 w-10 h-10 bg-neutral-800/80 backdrop-blur-xl border border-orange-500/30 rounded-full flex items-center justify-center text-white hover:bg-neutral-700/80 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-20 w-10 h-10 bg-neutral-800/80 backdrop-blur-xl border border-orange-500/30 rounded-full flex items-center justify-center text-white hover:bg-neutral-700/80 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Card - Compact Height */}
          <div className="relative h-[280px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 200, damping: 25 },
                  opacity: { duration: 0.3 }
                }}
                className="absolute inset-0"
              >
                <div className="relative h-full bg-gradient-to-br from-neutral-900/90 via-neutral-800/50 to-neutral-900/90 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-6 overflow-hidden group hover:border-orange-500/40 transition duration-300">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  
                  {/* Quote Icon - Compact */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                    <Quote className="w-5 h-5 text-orange-400/40" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      {/* Stars - Compact */}
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        ))}
                      </div>

                      {/* Comment Text - Compact */}
                      <p className="text-base font-medium text-white leading-relaxed mb-4 line-clamp-4">
                        "{currentComment.text}"
                      </p>
                    </div>

                    {/* Author - Compact */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-base font-bold text-white shadow-lg">
                        {currentComment.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {currentComment.user?.name || 'Utilisateur anonyme'}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {new Date(currentComment.createdAt).toLocaleDateString('fr-FR', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators - Compact */}
          <div className="flex justify-center gap-1.5 mt-6">
            {commentsList.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-6 bg-gradient-to-r from-orange-500 to-amber-500' 
                    : 'w-1 bg-neutral-700 hover:bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
