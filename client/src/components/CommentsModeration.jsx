import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';

export default function CommentsModeration() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingComments, setPendingComments] = useState([]);
  const [approvedComments, setApprovedComments] = useState([]);
  const [rejectedComments, setRejectedComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, commentId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchComments();
    
    // Auto-refresh tous les 30 secondes
    const interval = setInterval(() => {
      fetchComments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pending
      const pendingRes = await axios.get(
        `https://freelancing-app-mdgw.onrender.com/api/comments/admin/pending`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // S'assurer que c'est un array
      const allComments = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      
      // Separate into categories
      const pending = allComments.filter(c => c.status === 'pending');
      const approved = allComments.filter(c => c.status === 'approved');
      const rejected = allComments.filter(c => c.status === 'rejected');
      
      setPendingComments(pending);
      setApprovedComments(approved);
      setRejectedComments(rejected);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://freelancing-app-mdgw.onrender.com/api/comments/${commentId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('Commentaire approuve et publie!');
      fetchComments();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://freelancing-app-mdgw.onrender.com/api/comments/${rejectionModal.commentId}/reject`,
        { reason: rejectionReason },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('Commentaire rejete');
      setRejectionModal({ isOpen: false, commentId: null });
      setRejectionReason('');
      fetchComments();
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      alert('Erreur lors du rejet');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Etes-vous sur de vouloir supprimer ce commentaire?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `https://freelancing-app-mdgw.onrender.com/api/comments/admin/${commentId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        alert('Commentaire supprime');
        fetchComments();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const renderComments = (comments, status) => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucun commentaire {status}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{comment.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < comment.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-gray-700 mb-3">{comment.text}</p>

                {/* Status Badge */}
                {status === 'rejete' && comment.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <p className="font-semibold text-red-900 mb-1">Raison du rejet:</p>
                    <p className="text-red-800">{comment.rejectionReason}</p>
                  </div>
                )}

                {status === 'approuve' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-800">
                      ✓ Publie le {new Date(comment.approvedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {status === 'en attente' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(comment._id)}
                    className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition"
                    title="Approuver"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => setRejectionModal({ isOpen: true, commentId: comment._id })}
                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                    title="Rejeter"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Always show delete button */}
            {status !== 'en attente' && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const stats = [
    { label: 'En attente', count: pendingComments.length, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Approuves', count: approvedComments.length, color: 'bg-green-100 text-green-700' },
    { label: 'Rejetes', count: rejectedComments.length, color: 'bg-red-100 text-red-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${stat.color} rounded-lg p-4 text-center`}
          >
            <div className="text-3xl font-bold">{stat.count}</div>
            <div className="text-sm font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'pending' && `En attente (${pendingComments.length})`}
              {tab === 'approved' && `Approuves (${approvedComments.length})`}
              {tab === 'rejected' && `Rejetes (${rejectedComments.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'pending' && renderComments(pendingComments, 'en attente')}
          {activeTab === 'approved' && renderComments(approvedComments, 'approuve')}
          {activeTab === 'rejected' && renderComments(rejectedComments, 'rejete')}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
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
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeter ce commentaire</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value.slice(0, 200))}
              placeholder="Raison du rejet (optionnel)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4 text-gray-900 bg-white placeholder:text-gray-400"
              rows={3}
            />
            <p className="text-xs text-gray-500 mb-6">{rejectionReason.length}/200</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectionModal({ isOpen: false, commentId: null });
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Rejeter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}