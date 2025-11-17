import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, User, MessageCircle } from 'lucide-react';
import CommentForm from './CommentForm';

export default function TaskCard({ task, onComment }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [hasCommented, setHasCommented] = useState(false);

  const handleCommentSubmitted = () => {
    setHasCommented(true);
    setShowCommentForm(false);
    onComment?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
          </div>
          <div className="text-right">
            {task.budget && (
              <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                <DollarSign size={18} />
                {task.budget}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          {task.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{task.location}</span>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>
                {new Date(task.deadline).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Client Info */}
        {task.userId && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            <User size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              Par <span className="font-semibold">{task.userId.name}</span>
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-4">
          {task.status === 'completed' && (
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              ✓ Completee
            </span>
          )}
          {task.status === 'in-progress' && (
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              En cours
            </span>
          )}
          {task.status === 'open' && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
              Ouverte
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {task.status === 'completed' && !hasCommented && (
            <button
              onClick={() => setShowCommentForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <MessageCircle size={18} />
              Laisser un avis
            </button>
          )}
          {hasCommented && (
            <div className="flex-1 flex items-center justify-center bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
              ✓ Avis soumis
            </div>
          )}
          {task.status !== 'completed' && (
            <button
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Postuler
            </button>
          )}
        </div>
      </motion.div>

      {/* Comment Form Modal */}
      {showCommentForm && (
        <CommentForm
          taskId={task._id}
          onCommentSubmitted={handleCommentSubmitted}
          onClose={() => setShowCommentForm(false)}
        />
      )}
    </>
  );
}
