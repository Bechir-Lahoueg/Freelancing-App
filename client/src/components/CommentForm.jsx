import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Star, X, Send } from 'lucide-react';

export default function CommentForm({ onCommentSubmitted, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    if (text.trim().length < 10) {
      alert('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://freelancing-app-mdgw.onrender.com/api/comments`,
        { rating, text },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSubmitted(true);
      setTimeout(() => {
        onCommentSubmitted?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert(error.response?.data?.message || 'Erreur lors de la soumission du commentaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">Laisser un avis</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="bg-green-100 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Merci!</h3>
                <p className="text-gray-600">Votre commentaire a été soumis et est en attente d'approbation.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre note
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Votre commentaire ({text.length}/500)
                  </label>
                  <textarea
                    id="comment"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    placeholder="Partagez votre expérience avec ce prestataire..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-gray-900 bg-white placeholder:text-gray-400"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 caractères, maximum 500 caractères
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
