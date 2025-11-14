import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CommentForm from '../components/CommentForm';
import axios from 'axios';
import { Menu, X, Home, MessageSquare, Settings, LogOut, Trash2, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [myComments, setMyComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const menuItems = [
    { id: 'welcome', label: 'Accueil', icon: Home },
    { id: 'comments', label: 'Mes Commentaires', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchMyComments();
    }
  }, [activeTab]);

  const fetchMyComments = async () => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`${API_URL}/comments/my-comments`, { headers });
      setMyComments(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setMyComments([]);
    } finally {
      setLoadingComments(false);
    }
  };



  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Êtes-vous sûr?')) {
      try {
        await axios.delete(`${API_URL}/comments/${commentId}`, { headers });
        setMyComments(myComments.filter(c => c._id !== commentId));
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Approuvé' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rejeté' }
    };
    const badge = badges[status];
    return badge ? (
      <span className={`inline-block ${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.label}
      </span>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='fixed top-20 left-4 z-40 p-2 hover:bg-slate-700 rounded-lg lg:hidden'
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:relative z-30`}
        >
          <div className='p-6'>
            <h2 className='text-xl font-bold mb-8 text-blue-400'>Do It</h2>
            
            <nav className='space-y-2'>
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className='absolute bottom-6 left-6 right-6'>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition'
              >
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-6'>
          <div className='max-w-6xl mx-auto'>
            <h1 className='text-4xl font-bold mb-2'>Bienvenue, {user?.name}!</h1>
            <p className='text-slate-400 mb-8'>Gérez votre profil et vos commentaires</p>

            {/* Welcome Tab */}
            {activeTab === 'welcome' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-slate-800 border border-slate-700 rounded-lg p-8'
              >
                <h2 className='text-2xl font-bold mb-6'>Informations du Profil</h2>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
                    <span className='text-slate-400'>Email:</span>
                    <span className='font-semibold'>{user?.email}</span>
                  </div>
                  <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
                    <span className='text-slate-400'>Nom:</span>
                    <span className='font-semibold'>{user?.name}</span>
                  </div>
                  <div className='flex justify-between items-center pb-4 border-b border-slate-700'>
                    <span className='text-slate-400'>Année universitaire:</span>
                    <span className='font-semibold'>{user?.universityYear || 'Non spécifiée'}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-400'>Rôle:</span>
                    <span className='font-semibold capitalize'>{user?.role || 'Utilisateur'}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-bold'>Mes Commentaires</h2>
                  {!showCommentForm && (
                    <button
                      onClick={() => setShowCommentForm(true)}
                      className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition'
                    >
                      <Plus size={20} />
                      Nouveau Commentaire
                    </button>
                  )}
                </div>

                {showCommentForm && (
                  <div className='mb-8 bg-slate-800 border border-slate-700 rounded-lg p-6'>
                    <CommentForm
                      onCommentSubmitted={() => {
                        setShowCommentForm(false);
                        fetchMyComments();
                      }}
                      onClose={() => {
                        setShowCommentForm(false);
                      }}
                    />
                  </div>
                )}

                {loadingComments ? (
                  <div className='flex justify-center py-12'>
                    <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : myComments.length === 0 ? (
                  <div className='bg-slate-800 border border-slate-700 rounded-lg p-8 text-center'>
                    <MessageSquare size={48} className='mx-auto mb-4 text-slate-500' />
                    <p className='text-slate-400'>Vous n\'avez pas encore écrit de commentaires</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {myComments.map((comment, index) => (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className='bg-slate-800 border border-slate-700 rounded-lg p-6 hover:shadow-lg transition'
                      >
                        <div className='flex justify-between items-start mb-4'>
                          <div className='flex-1'>
                            <div className='flex gap-1 mb-3'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  className={`${
                                    i < comment.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>

                            <div className='mb-3'>
                              {getStatusBadge(comment.status)}
                            </div>

                            <p className='text-slate-300 mb-3'>{comment.text}</p>

                            {comment.status === 'rejected' && comment.rejectionReason && (
                              <div className='bg-red-500/10 border border-red-500/30 rounded p-3 text-sm text-red-300 mt-3'>
                                <p className='font-semibold mb-1'>Raison du rejet:</p>
                                <p>{comment.rejectionReason}</p>
                              </div>
                            )}

                            <p className='text-xs text-slate-500 mt-3'>
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className='p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition ml-4'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-slate-800 border border-slate-700 rounded-lg p-8'
              >
                <h2 className='text-2xl font-bold mb-6'>Paramètres</h2>
                <div className='p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
                  <p className='text-blue-300'>ℹ️ La modification du profil sera disponible prochainement.</p>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
