import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import CommentForm from '../components/CommentForm';
import ChatPanel from '../components/ChatPanel';
import axios from 'axios';
import { Menu, X, Home, MessageSquare, Settings, LogOut, Trash2, Star, Plus, Briefcase, CheckCircle, Clock, XCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [myComments, setMyComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showConversationNotif, setShowConversationNotif] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const menuItems = [
    { id: 'welcome', label: 'Accueil', icon: Home },
    { id: 'tasks', label: 'Mes Tâches', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount },
    { id: 'comments', label: 'Mes Commentaires', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  useEffect(() => {
    // Charger les commentaires au démarrage pour les stats
    fetchMyComments();
    fetchMyTasks();
    fetchUnreadMessagesCount();
  }, []);

  // Écouter les nouvelles conversations via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('conversation:created', ({ userId, conversation }) => {
        if (userId === user._id) {
          setShowConversationNotif(true);
          setActiveTab('messages'); // Ouvrir automatiquement l'onglet messages
          fetchUnreadMessagesCount();
          setTimeout(() => setShowConversationNotif(false), 5000);
        }
      });

      socket.on('message:received', ({ conversationId }) => {
        // Mettre à jour le compteur si on n'est pas sur l'onglet messages
        if (activeTab !== 'messages') {
          fetchUnreadMessagesCount();
        }
      });

      return () => {
        socket.off('conversation:created');
        socket.off('message:received');
      };
    }
  }, [socket, user, activeTab]);

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchMyComments();
    } else if (activeTab === 'tasks') {
      fetchMyTasks();
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

  const fetchMyTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await axios.get(`${API_URL}/tasks`, { headers });
      setMyTasks(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setMyTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/conversations`, { headers });
      const totalUnread = response.data.reduce((acc, conv) => {
        return acc + (conv.unreadCount?.[user._id] || 0);
      }, 0);
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error('Erreur chargement compteur messages:', error);
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
      pending: { 
        bg: 'bg-yellow-500/20', 
        text: 'text-yellow-400', 
        border: 'border-yellow-500/30',
        label: '⏳ En attente' 
      },
      approved: { 
        bg: 'bg-green-500/20', 
        text: 'text-green-400', 
        border: 'border-green-500/30',
        label: '✅ Approuvé' 
      },
      rejected: { 
        bg: 'bg-red-500/20', 
        text: 'text-red-400', 
        border: 'border-red-500/30',
        label: '❌ Rejeté' 
      }
    };
    const badge = badges[status];
    return badge ? (
      <span className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} border ${badge.border} px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm`}>
        {badge.label}
      </span>
    ) : null;
  };

  return (
    <div className="h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Notification de nouvelle conversation */}
      <AnimatePresence>
        {showConversationNotif && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl shadow-2xl cursor-pointer"
            onClick={() => {
              setShowConversationNotif(false);
              setActiveTab('messages');
            }}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Nouvelle conversation !</p>
                <p className="text-sm text-blue-100">Votre demande a été approuvée. Cliquez pour discuter.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-1 overflow-hidden mt-20">
        {/* Sidebar Toggle Button - Mobile only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='fixed top-24 left-4 z-40 p-2 hover:bg-slate-700 rounded-lg lg:hidden bg-slate-800/90 backdrop-blur-sm'
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:relative z-30 flex flex-col overflow-hidden`}
        >
          <div className='p-6 flex-1 overflow-y-auto custom-scrollbar'>
            <h2 className='text-xl font-bold mb-2 text-orange-400'>Do It</h2>
            <p className='text-xs text-slate-400 mb-8'>Tableau de bord étudiant</p>
            
            <nav className='space-y-2'>
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                      if (item.id === 'messages') {
                        fetchUnreadMessagesCount();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile Section in Sidebar */}
          <div className='p-4 border-t border-slate-700 flex-shrink-0'>
            <div className='mb-3 p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold'>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-white truncate'>{user?.name}</p>
                  <p className='text-xs text-slate-400 truncate'>{user?.universityYear || 'Étudiant'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className='w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition'
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1 overflow-y-auto custom-scrollbar p-6'>
          <div className='max-w-6xl mx-auto'>
            {/* Header avec gradient */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent'>
                Bienvenue, {user?.name}!
              </h1>
              <p className='text-slate-400'>Gérez votre profil et vos activités</p>
            </div>

            {/* Welcome Tab */}
            {activeTab === 'welcome' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-6'
              >
                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className='bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-6'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <MessageSquare className='text-orange-400' size={32} />
                      <span className='text-3xl font-bold text-white'>
                        {myComments.filter(c => c.status === 'approved').length}
                      </span>
                    </div>
                    <p className='text-sm text-slate-300'>Commentaires approuvés</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className='bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <Star className='text-blue-400' size={32} />
                      <span className='text-3xl font-bold text-white'>
                        {myComments.length}
                      </span>
                    </div>
                    <p className='text-sm text-slate-300'>Total des avis</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className='bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <Settings className='text-purple-400' size={32} />
                      <span className='text-3xl font-bold text-white capitalize'>
                        {user?.universityYear || 'N/A'}
                      </span>
                    </div>
                    <p className='text-sm text-slate-300'>Niveau d'études</p>
                  </motion.div>
                </div>

                {/* Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 shadow-2xl'
                >
                  <div className='flex items-start gap-6 mb-6'>
                    <div className='w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <h2 className='text-2xl font-bold mb-1'>{user?.name}</h2>
                      <p className='text-orange-400 font-medium mb-2 capitalize'>{user?.role || 'Étudiant'}</p>
                      <p className='text-slate-400 text-sm'>Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg'>
                        <div className='w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center'>
                          <span className='text-orange-400'>📧</span>
                        </div>
                        <div>
                          <p className='text-xs text-slate-400'>Email</p>
                          <p className='font-semibold text-white'>{user?.email}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg'>
                        <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                          <span className='text-blue-400'>🎓</span>
                        </div>
                        <div>
                          <p className='text-xs text-slate-400'>Année universitaire</p>
                          <p className='font-semibold text-white'>{user?.universityYear || 'Non spécifiée'}</p>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-center p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-lg'>
                      <div className='text-center'>
                        <p className='text-4xl font-bold text-orange-400 mb-2'>
                          {myComments.length > 0 
                            ? (myComments.reduce((acc, c) => acc + c.rating, 0) / myComments.length).toFixed(1)
                            : '0.0'}
                        </p>
                        <p className='text-sm text-slate-400'>Note moyenne donnée</p>
                        <div className='flex gap-1 justify-center mt-2'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className='fill-orange-400 text-orange-400'
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='grid md:grid-cols-2 gap-4'
                >
                  <button
                    onClick={() => setActiveTab('comments')}
                    className='flex items-center gap-4 p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl hover:border-orange-500/50 transition group'
                  >
                    <MessageSquare className='text-orange-400 group-hover:scale-110 transition' size={32} />
                    <div className='text-left'>
                      <p className='font-bold text-white'>Mes Commentaires</p>
                      <p className='text-sm text-slate-400'>Gérer vos avis</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className='flex items-center gap-4 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition group'
                  >
                    <Settings className='text-blue-400 group-hover:scale-110 transition' size={32} />
                    <div className='text-left'>
                      <p className='font-bold text-white'>Paramètres</p>
                      <p className='text-sm text-slate-400'>Configurer votre compte</p>
                    </div>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className='flex justify-between items-center mb-6'>
                  <div>
                    <h2 className='text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent'>
                      Mes Tâches
                    </h2>
                    <p className='text-slate-400 mt-1'>Suivez l'état de vos demandes de services</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/categories')}
                    className='flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3 rounded-xl transition shadow-lg'
                  >
                    <Plus size={20} />
                    Nouvelle Demande
                  </motion.button>
                </div>

                {loadingTasks ? (
                  <div className='flex justify-center py-12'>
                    <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : myTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-12 text-center'
                  >
                    <div className='w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Briefcase size={40} className='text-orange-400' />
                    </div>
                    <h3 className='text-xl font-bold text-white mb-2'>Aucune tâche</h3>
                    <p className='text-slate-400 mb-6'>Vous n'avez pas encore soumis de demande</p>
                    <button
                      onClick={() => navigate('/categories')}
                      className='inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:shadow-xl transition'
                    >
                      <Plus size={20} />
                      Créer ma première demande
                    </button>
                  </motion.div>
                ) : (
                  <div className='space-y-4'>
                    {myTasks.map((task, index) => {
                      const statusConfig = {
                        pending: { 
                          icon: Clock, 
                          color: 'text-yellow-400', 
                          bg: 'bg-yellow-500/20', 
                          border: 'border-yellow-500/30',
                          label: 'En attente' 
                        },
                        approved: { 
                          icon: CheckCircle, 
                          color: 'text-green-400', 
                          bg: 'bg-green-500/20', 
                          border: 'border-green-500/30',
                          label: 'Approuvée' 
                        },
                        rejected: { 
                          icon: XCircle, 
                          color: 'text-red-400', 
                          bg: 'bg-red-500/20', 
                          border: 'border-red-500/30',
                          label: 'Rejetée' 
                        }
                      };

                      const status = statusConfig[task.status] || statusConfig.pending;
                      const StatusIcon = status.icon;

                      return (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-xl hover:border-orange-500/30 transition group'
                        >
                          <div className='flex justify-between items-start mb-4'>
                            <div className='flex items-center gap-3'>
                              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl'>
                                {task.serviceId?.icon || task.categoryId?.icon || '📋'}
                              </div>
                              <div>
                                <h3 className='text-xl font-bold text-white'>{task.title}</h3>
                                <p className='text-sm text-slate-400'>
                                  {task.serviceId?.name || 'Service'} · {task.categoryId?.name || 'Catégorie'}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-2 ${status.bg} ${status.color} border ${status.border} px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm`}>
                              <StatusIcon size={16} />
                              {status.label}
                            </span>
                          </div>

                          <p className='text-slate-300 mb-4'>{task.description}</p>

                          {task.budget && (
                            <div className='flex items-center gap-2 text-sm text-slate-400 mb-2'>
                              <span className='font-semibold'>Budget:</span>
                              <span className='text-orange-400'>{task.budget} DZD</span>
                            </div>
                          )}

                          {task.deadline && (
                            <div className='flex items-center gap-2 text-sm text-slate-400 mb-4'>
                              <span className='font-semibold'>Date limite:</span>
                              <span>{new Date(task.deadline).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}

                          {task.responses && task.responses.length > 0 && (
                            <div className='mt-4 pt-4 border-t border-slate-700'>
                              <h4 className='text-sm font-semibold text-slate-300 mb-3'>Réponses:</h4>
                              <div className='space-y-2'>
                                {task.responses.map((response, idx) => (
                                  <div key={idx} className='text-sm'>
                                    <span className='text-slate-400'>{response.questionLabel}:</span>{' '}
                                    <span className='text-white font-medium'>
                                      {Array.isArray(response.answer) 
                                        ? response.answer.join(', ') 
                                        : response.answer}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className='flex items-center gap-4 mt-4 text-xs text-slate-500'>
                            <span>Créé le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="h-[calc(100vh-200px)]">
                  <ChatPanel />
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
                  <div>
                    <h2 className='text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent'>
                      Mes Commentaires
                    </h2>
                    <p className='text-slate-400 mt-1'>Gérez vos avis et témoignages</p>
                  </div>
                  {!showCommentForm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCommentForm(true)}
                      className='flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-3 rounded-xl transition shadow-lg'
                    >
                      <Plus size={20} />
                      Nouveau Commentaire
                    </motion.button>
                  )}
                </div>

                {showCommentForm && (
                  <div className='mb-8'>
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
                    <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : myComments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-12 text-center'
                  >
                    <div className='w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <MessageSquare size={40} className='text-orange-400' />
                    </div>
                    <h3 className='text-xl font-bold text-white mb-2'>Aucun commentaire</h3>
                    <p className='text-slate-400 mb-6'>Vous n'avez pas encore écrit d'avis</p>
                    <button
                      onClick={() => setShowCommentForm(true)}
                      className='inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:shadow-xl transition'
                    >
                      <Plus size={20} />
                      Écrire mon premier avis
                    </button>
                  </motion.div>
                ) : (
                  <div className='space-y-4'>
                    {myComments.map((comment, index) => (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-xl hover:border-orange-500/30 transition group'
                      >
                        <div className='flex justify-between items-start mb-4'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-3'>
                              <div className='flex gap-1'>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={20}
                                    className={`${
                                      i < comment.rating
                                        ? 'fill-orange-400 text-orange-400'
                                        : 'text-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              {getStatusBadge(comment.status)}
                            </div>

                            <p className='text-slate-200 leading-relaxed mb-4'>{comment.text}</p>

                            {comment.status === 'rejected' && comment.rejectionReason && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className='bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300 mt-3'
                              >
                                <p className='font-semibold mb-1 flex items-center gap-2'>
                                  <X size={16} />
                                  Raison du rejet:
                                </p>
                                <p>{comment.rejectionReason}</p>
                              </motion.div>
                            )}

                            <div className='flex items-center gap-4 mt-4 text-xs text-slate-500'>
                              <span>📅 {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}</span>
                              {comment.approvedAt && (
                                <span>✅ Approuvé le {new Date(comment.approvedAt).toLocaleDateString('fr-FR')}</span>
                              )}
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteComment(comment._id)}
                            className='p-3 text-red-400 hover:bg-red-500/20 rounded-lg transition ml-4'
                            title='Supprimer'
                          >
                            <Trash2 size={20} />
                          </motion.button>
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
