import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import CommentsModeration from '../components/CommentsModeration';
import ChatSection from '../components/ChatSection';
import axios from 'axios';
import { Menu, X, LayoutGrid, Users, Settings, BarChart3, LogOut, Upload, MessageSquare, TrendingUp, CheckCircle, Clock, XCircle, Star, Activity, Briefcase, MessageCircle, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [stats, setStats] = useState({
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0,
    rejectedComments: 0,
    totalUsers: 0,
    totalTasks: 0,
    pendingTasks: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSuperAdminForm, setShowSuperAdminForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    image: null
  });
  const [superAdminForm, setSuperAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedCategoryForServices, setSelectedCategoryForServices] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    icon: '📋',
    image: '',
    basePrice: 0,
    estimatedDuration: '',
    questions: []
  });
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_URL || 'https://freelancing-app-mdgw.onrender.com'}/api`;
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const menuItems = [
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'tasks', label: 'Gestion des Taches', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'superadmins', label: 'Super Admins', icon: Users, adminOnly: true },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare, adminOnly: true },
    { id: 'partners', label: 'Demandes Partenariat', icon: Handshake },
    { id: 'settings', label: 'Parametres', icon: Settings }
  ];

  useEffect(() => {
    fetchUnreadMessagesCount();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message:received', () => {
        if (activeTab !== 'messages') {
          fetchUnreadMessagesCount();
        }
      });

      return () => {
        socket.off('message:received');
      };
    }
  }, [socket, activeTab]);

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'superadmins' && user?.role === 'superadmin') {
      fetchSuperAdmins();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'tasks') {
      fetchAllTasks();
    } else if (activeTab === 'services') {
      fetchCategories(); // Pour la selection de categorie
    } else if (activeTab === 'messages') {
      fetchUnreadMessagesCount();
    } else if (activeTab === 'partners') {
      fetchPartnerRequests();
    }
  }, [activeTab]);

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

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch comments stats
      const commentsRes = await axios.get(`${API_URL}/comments/admin/pending`, { headers });
      const allComments = Array.isArray(commentsRes.data) ? commentsRes.data : [];
      
      // Fetch tasks stats
      const tasksRes = await axios.get(`${API_URL}/admin/tasks/all`, { headers });
      const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      
      setStats({
        totalComments: allComments.length,
        pendingComments: allComments.filter(c => c.status === 'pending').length,
        approvedComments: allComments.filter(c => c.status === 'approved').length,
        rejectedComments: allComments.filter(c => c.status === 'rejected').length,
        totalUsers: superAdmins.length + 1,
        totalTasks: allTasks.length,
        pendingTasks: allTasks.filter(t => t.status === 'pending').length,
        recentActivity: allComments.slice(0, 5)
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await axios.get(`${API_URL}/admin/tasks/all`, { headers });
      setAllTasks(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setAllTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await axios.put(`${API_URL}/admin/tasks/${taskId}/approve`, {}, { headers });
      fetchAllTasks();
      if (activeTab === 'stats') fetchStats();
      alert('Tache approuvee avec succes');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRejectTask = async (taskId) => {
    const reason = prompt('Raison du rejet (optionnel):');
    try {
      await axios.put(`${API_URL}/admin/tasks/${taskId}/reject`, { reason }, { headers });
      fetchAllTasks();
      if (activeTab === 'stats') fetchStats();
      alert('Tache rejetee');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du rejet');
    }
  };

  // Gestion des services
  const fetchServicesByCategory = async (categoryId) => {
    setLoadingServices(true);
    setSelectedCategoryForServices(categoryId);
    try {
      const response = await axios.get(`${API_URL}/admin/services/by-category/${categoryId}`, { headers });
      setServices(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServiceId) {
        // Mise a jour
        await axios.put(`${API_URL}/admin/services/${editingServiceId}`, serviceForm, { headers });
        alert('Service mis a jour !');
      } else {
        // Creation
        await axios.post(`${API_URL}/admin/services`, {
          ...serviceForm,
          categoryId: selectedCategoryForServices
        }, { headers });
        alert('Service cree !');
      }
      
      setShowServiceForm(false);
      setEditingServiceId(null);
      resetServiceForm();
      fetchServicesByCategory(selectedCategoryForServices);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      icon: service.icon,
      image: service.image || '',
      basePrice: service.basePrice || 0,
      estimatedDuration: service.estimatedDuration || '',
      questions: service.questions || []
    });
    setEditingServiceId(service._id);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Supprimer ce service ?')) {
      try {
        await axios.delete(`${API_URL}/admin/services/${serviceId}`, { headers });
        alert('Service supprime !');
        fetchServicesByCategory(selectedCategoryForServices);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      icon: '📋',
      image: '',
      basePrice: 0,
      estimatedDuration: '',
      questions: []
    });
    setEditingServiceId(null);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      label: '',
      type: 'text',
      options: [],
      placeholder: '',
      required: false,
      order: serviceForm.questions.length
    };
    setServiceForm({
      ...serviceForm,
      questions: [...serviceForm.questions, newQuestion]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...serviceForm.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setServiceForm({
      ...serviceForm,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = serviceForm.questions.filter((_, i) => i !== index);
    setServiceForm({
      ...serviceForm,
      questions: updatedQuestions
    });
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL + '/admin/categories', { headers });
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerRequests = async (status = null) => {
    setLoadingPartners(true);
    try {
      const url = status 
        ? `${API_URL}/admin/partner-requests?status=${status}`
        : `${API_URL}/admin/partner-requests`;
      const response = await axios.get(url, { headers });
      setPartnerRequests(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleApprovePartner = async (id, notes = '') => {
    try {
      await axios.put(`${API_URL}/admin/partner-requests/${id}/approve`, { notes }, { headers });
      fetchPartnerRequests();
      setSelectedRequest(null);
      alert('Demande approuvee avec succes !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRejectPartner = async (id, reason) => {
    if (!reason || reason.trim() === '') {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }
    try {
      await axios.put(`${API_URL}/admin/partner-requests/${id}/reject`, { reason }, { headers });
      fetchPartnerRequests();
      setSelectedRequest(null);
      alert('Demande rejetee');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du rejet');
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette demande ?')) return;
    try {
      await axios.delete(`${API_URL}/admin/partner-requests/${id}`, { headers });
      fetchPartnerRequests();
      setSelectedRequest(null);
      alert('Demande supprimee');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Creer un apercu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCategoryForm({...categoryForm, image: file});
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    setCategoryForm({...categoryForm, image: null});
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      formData.append('icon', categoryForm.icon);
      formData.append('color', categoryForm.color);
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      console.log('📤 Sending FormData with file:', categoryForm.image);

      const response = await axios.post(API_URL + '/admin/categories', formData, {
        headers: { 
          Authorization: 'Bearer ' + token
          // Don't set Content-Type, let axios set it automatically with boundary
        }
      });

      console.log('✅ Response:', response.data);

      setCategoryForm({ name: '', description: '', icon: '', color: '#3B82F6', image: null });
      setImagePreview(null);
      setShowCategoryForm(false);
      fetchCategories();
      alert('Categorie creee avec succes!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la creation: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Etes-vous sur?')) return;
    setLoading(true);
    try {
      await axios.delete(API_URL + '/admin/categories/' + id, { headers });
      fetchCategories();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      image: null
    });
    // Afficher l'image existante en apercu
    if (category.image) {
      setImagePreview(category.image);
    }
    setShowCategoryForm(true);
  };

  const handleCategoryUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      formData.append('icon', categoryForm.icon);
      formData.append('color', categoryForm.color);
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      const response = await axios.put(API_URL + '/admin/categories/' + editingCategoryId, formData, {
        headers: { 
          Authorization: 'Bearer ' + token
          // Don't set Content-Type, let axios set it automatically
        }
      });

      console.log('✅ Updated:', response.data);

      setCategoryForm({ name: '', description: '', icon: '', color: '#3B82F6', image: null });
      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setImagePreview(null);
      fetchCategories();
      alert('Categorie mise a jour avec succes!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise a jour: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '', icon: '', color: '#3B82F6', image: null });
    setImagePreview(null);
    setShowCategoryForm(false);
  };

  const fetchSuperAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL + '/admin/superadmins', { headers });
      setSuperAdmins(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL + '/admin/superadmins', superAdminForm, { headers });
      setSuperAdminForm({ name: '', email: '', password: '' });
      setShowSuperAdminForm(false);
      fetchSuperAdmins();
      alert('Super admin cree avec succes!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + (error.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuperAdmin = async (id) => {
    if (!window.confirm('Etes-vous sur?')) return;
    setLoading(true);
    try {
      await axios.delete(API_URL + '/admin/superadmins/' + id, { headers });
      fetchSuperAdmins();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchConversation = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/search/${searchCode.trim().toUpperCase()}`,
        { headers }
      );
      setSearchResult(response.data);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setSearchError(error.response?.data?.message || 'Conversation introuvable');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className='h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col'>
      <Navbar />
      
      <div className='flex flex-1 overflow-hidden mt-20'>
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col overflow-hidden`}>
          {/* Sidebar Header */}
          <div className='p-4 border-b border-slate-700 flex items-center justify-between'>
            {sidebarOpen && (
              <div>
                <h2 className='font-bold text-lg text-orange-400'>Do It Admin</h2>
                <p className='text-xs text-slate-400'>Tableau de bord</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='p-2 hover:bg-slate-700 rounded-lg transition'
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className='flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar'>
            {menuItems.map((item) => {
              if (item.adminOnly && user?.role !== 'superadmin') return null;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'messages') {
                      fetchUnreadMessagesCount();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title={item.label}
                >
                  <IconComponent size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                  {item.badge > 0 && sidebarOpen && (
                    <span className="ml-auto px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-bold shadow-lg animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.badge > 0 && !sidebarOpen && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg ring-2 ring-slate-800"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className='p-4 border-t border-slate-700'>
            {sidebarOpen ? (
              <div className='mb-4 p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg'>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-white truncate'>{user?.name}</p>
                    <p className='text-xs text-slate-400 truncate'>{user?.email}</p>
                  </div>
                </div>
                <div className='pt-3 border-t border-slate-600'>
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-xs font-bold text-orange-400'>
                    <span>👑</span>
                    {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
            ) : (
              <div className='mb-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg relative group'>
                <span className='text-lg font-bold text-white'>{user?.name?.charAt(0).toUpperCase()}</span>
                {/* Tooltip on hover */}
                <div className='absolute left-full ml-2 px-3 py-2 bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50'>
                  <p className='text-sm font-bold text-white'>{user?.name}</p>
                  <p className='text-xs text-slate-400'>{user?.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition font-medium'
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Deconnexion</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          <div className='p-8'>
            {/* Content Header */}
            <div className='mb-8'>
              {activeTab === 'stats' && (
                <>
                  <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent'>
                    Statistiques & Apercu
                  </h1>
                  <p className='text-slate-400'>Vue d'ensemble des performances de la plateforme</p>
                </>
              )}
              {activeTab === 'categories' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Categories</h1>
                  <p className='text-slate-400'>Gestion des categories de services</p>
                </>
              )}
              {activeTab === 'tasks' && (
                <>
                  <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent'>
                    Gestion des Taches
                  </h1>
                  <p className='text-slate-400'>Approuver ou rejeter les demandes de services</p>
                </>
              )}
              {activeTab === 'services' && (
                <>
                  <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
                    Gestion des Services
                  </h1>
                  <p className='text-slate-400'>Creer et gerer les services de chaque categorie</p>
                </>
              )}
              {activeTab === 'superadmins' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Super Admins</h1>
                  <p className='text-slate-400'>Gestion des administrateurs</p>
                </>
              )}
              {activeTab === 'comments' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Commentaires</h1>
                  <p className='text-slate-400'>Moderation des avis utilisateurs</p>
                </>
              )}
              {activeTab === 'settings' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Parametres</h1>
                  <p className='text-slate-400'>Configuration generale</p>
                </>
              )}
            </div>

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {loadingTasks ? (
                  <div className='flex justify-center py-12'>
                    <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : allTasks.length === 0 ? (
                  <div className='bg-slate-800 border border-slate-700 rounded-xl p-12 text-center'>
                    <Briefcase size={48} className='mx-auto text-slate-600 mb-4' />
                    <h3 className='text-xl font-bold text-white mb-2'>Aucune tache</h3>
                    <p className='text-slate-400'>Aucune demande de service pour le moment</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {allTasks.map((task, index) => {
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
                          label: 'Approuvee' 
                        },
                        rejected: { 
                          icon: XCircle, 
                          color: 'text-red-400', 
                          bg: 'bg-red-500/20', 
                          border: 'border-red-500/30',
                          label: 'Rejetee' 
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
                          className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:shadow-xl hover:border-orange-500/30 transition'
                        >
                          <div className='flex justify-between items-start mb-4'>
                            <div className='flex items-center gap-3 flex-1'>
                              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl'>
                                {task.serviceId?.icon || task.categoryId?.icon || '📋'}
                              </div>
                              <div className='flex-1'>
                                <h3 className='text-xl font-bold text-white'>{task.title}</h3>
                                <p className='text-sm text-slate-400'>
                                  {task.serviceId?.name || 'Service'} · {task.categoryId?.name || 'Categorie'}
                                </p>
                                <p className='text-xs text-slate-500 mt-1'>
                                  Par: {task.userId?.name || 'Utilisateur'} ({task.userId?.email || 'email'})
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-2 ${status.bg} ${status.color} border ${status.border} px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm`}>
                              <StatusIcon size={16} />
                              {status.label}
                            </span>
                          </div>

                          <p className='text-slate-300 mb-4'>{task.description}</p>

                          <div className='grid grid-cols-2 gap-4 mb-4'>
                            {task.budget && (
                              <div className='text-sm'>
                                <span className='text-slate-400'>Budget:</span>{' '}
                                <span className='text-orange-400 font-semibold'>{task.budget} DZD</span>
                              </div>
                            )}
                            {task.deadline && (
                              <div className='text-sm'>
                                <span className='text-slate-400'>Date limite:</span>{' '}
                                <span className='text-white'>{new Date(task.deadline).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                          </div>

                          {task.responses && task.responses.length > 0 && (
                            <div className='mb-4 pt-4 border-t border-slate-700'>
                              <h4 className='text-sm font-semibold text-slate-300 mb-3'>Reponses aux questions:</h4>
                              <div className='space-y-2'>
                                {task.responses.map((response, idx) => (
                                  <div key={idx} className='text-sm bg-slate-800/50 p-3 rounded-lg'>
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

                          {task.status === 'rejected' && task.rejectionReason && (
                            <div className='mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg'>
                              <p className='text-sm text-red-300'>
                                <span className='font-semibold'>Raison du rejet:</span> {task.rejectionReason}
                              </p>
                            </div>
                          )}

                          <div className='flex items-center justify-between pt-4 border-t border-slate-700'>
                            <span className='text-xs text-slate-500'>
                              Cree le {new Date(task.createdAt).toLocaleDateString('fr-FR')} a {new Date(task.createdAt).toLocaleTimeString('fr-FR')}
                            </span>
                            
                            {task.status === 'pending' && (
                              <div className='flex gap-3'>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleApproveTask(task._id)}
                                  className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition'
                                >
                                  <CheckCircle size={16} />
                                  Approuver
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRejectTask(task._id)}
                                  className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition'
                                >
                                  <XCircle size={16} />
                                  Rejeter
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {!selectedCategoryForServices ? (
                  <div>
                    <h2 className='text-2xl font-bold text-white mb-6'>Selectionnez une categorie</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {categories.map((category) => (
                        <motion.div
                          key={category._id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => fetchServicesByCategory(category._id)}
                          className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition'
                        >
                          <div className='flex items-center gap-4'>
                            <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl'>
                              {category.icon}
                            </div>
                            <div>
                              <h3 className='text-xl font-bold text-white'>{category.name}</h3>
                              <p className='text-sm text-slate-400'>{category.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className='flex items-center justify-between mb-6'>
                      <button
                        onClick={() => {
                          setSelectedCategoryForServices(null);
                          setServices([]);
                          setShowServiceForm(false);
                        }}
                        className='text-slate-400 hover:text-white transition'
                      >
                        ← Retour aux categories
                      </button>
                      <button
                        onClick={() => {
                          resetServiceForm();
                          setShowServiceForm(true);
                        }}
                        className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition'
                      >
                        + Nouveau Service
                      </button>
                    </div>

                    {showServiceForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className='bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6'
                      >
                        <h3 className='text-xl font-bold text-white mb-4'>
                          {editingServiceId ? 'Modifier le service' : 'Nouveau service'}
                        </h3>
                        <form onSubmit={handleServiceSubmit} className='space-y-4'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <label className='block text-sm font-medium text-slate-300 mb-2'>Nom du service *</label>
                              <input
                                type='text'
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                                required
                                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                                placeholder='Ex: Application Mobile'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-slate-300 mb-2'>Icone</label>
                              <input
                                type='text'
                                value={serviceForm.icon}
                                onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})}
                                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                                placeholder='📱'
                              />
                            </div>
                          </div>

                          <div>
                            <label className='block text-sm font-medium text-slate-300 mb-2'>Description *</label>
                            <textarea
                              value={serviceForm.description}
                              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                              required
                              rows={3}
                              className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                              placeholder='Description detaillee du service'
                            />
                          </div>

                          <div className='grid grid-cols-3 gap-4'>
                            <div>
                              <label className='block text-sm font-medium text-slate-300 mb-2'>Prix de base (DZD)</label>
                              <input
                                type='number'
                                value={serviceForm.basePrice}
                                onChange={(e) => setServiceForm({...serviceForm, basePrice: parseFloat(e.target.value)})}
                                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                                placeholder='0'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-slate-300 mb-2'>Duree estimee</label>
                              <input
                                type='text'
                                value={serviceForm.estimatedDuration}
                                onChange={(e) => setServiceForm({...serviceForm, estimatedDuration: e.target.value})}
                                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                                placeholder='2-3 jours'
                              />
                            </div>
                            <div>
                              <label className='block text-sm font-medium text-slate-300 mb-2'>Image URL</label>
                              <input
                                type='text'
                                value={serviceForm.image}
                                onChange={(e) => setServiceForm({...serviceForm, image: e.target.value})}
                                className='w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white'
                                placeholder='https://...'
                              />
                            </div>
                          </div>

                          {/* Questions Section */}
                          <div className='border-t border-slate-700 pt-4 mt-4'>
                            <div className='flex items-center justify-between mb-4'>
                              <h4 className='text-lg font-bold text-white'>Questions pour ce service</h4>
                              <button
                                type='button'
                                onClick={addQuestion}
                                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition'
                              >
                                + Ajouter une question
                              </button>
                            </div>

                            {serviceForm.questions.length === 0 ? (
                              <p className='text-slate-400 text-center py-4'>Aucune question. Cliquez sur "Ajouter une question"</p>
                            ) : (
                              <div className='space-y-4'>
                                {serviceForm.questions.map((question, index) => (
                                  <div key={question.id} className='bg-slate-700/50 p-4 rounded-lg border border-slate-600'>
                                    <div className='flex items-center justify-between mb-3'>
                                      <span className='text-sm font-semibold text-slate-300'>Question {index + 1}</span>
                                      <button
                                        type='button'
                                        onClick={() => removeQuestion(index)}
                                        className='text-red-400 hover:text-red-300'
                                      >
                                        ✕ Supprimer
                                      </button>
                                    </div>

                                    <div className='grid grid-cols-2 gap-3 mb-3'>
                                      <div>
                                        <label className='block text-xs text-slate-400 mb-1'>Question</label>
                                        <input
                                          type='text'
                                          value={question.label}
                                          onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                                          className='w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm'
                                          placeholder='Ex: Quelle plateforme ciblez-vous ?'
                                        />
                                      </div>
                                      <div>
                                        <label className='block text-xs text-slate-400 mb-1'>Type</label>
                                        <select
                                          value={question.type}
                                          onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                                          className='w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm'
                                        >
                                          <option value='text'>Texte</option>
                                          <option value='textarea'>Texte long</option>
                                          <option value='number'>Nombre</option>
                                          <option value='select'>Selection</option>
                                          <option value='radio'>Radio</option>
                                          <option value='checkbox'>Cases a cocher</option>
                                          <option value='date'>Date</option>
                                          <option value='email'>Email</option>
                                          <option value='tel'>Telephone</option>
                                        </select>
                                      </div>
                                    </div>

                                    {['select', 'radio', 'checkbox'].includes(question.type) && (
                                      <div className='mb-3'>
                                        <label className='block text-xs text-slate-400 mb-1'>Options (separees par des virgules)</label>
                                        <input
                                          type='text'
                                          value={question.options?.join(', ') || ''}
                                          onChange={(e) => updateQuestion(index, 'options', e.target.value.split(',').map(o => o.trim()))}
                                          className='w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm'
                                          placeholder='iOS, Android, Web'
                                        />
                                      </div>
                                    )}

                                    <div className='flex items-center gap-4'>
                                      <label className='flex items-center gap-2 text-sm text-slate-300'>
                                        <input
                                          type='checkbox'
                                          checked={question.required}
                                          onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                          className='rounded'
                                        />
                                        Obligatoire
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className='flex gap-3 pt-4'>
                            <button
                              type='submit'
                              className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition'
                            >
                              {editingServiceId ? 'Mettre a jour' : 'Creer le service'}
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                setShowServiceForm(false);
                                resetServiceForm();
                              }}
                              className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition'
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* Services List */}
                    {loadingServices ? (
                      <div className='flex justify-center py-12'>
                        <div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin' />
                      </div>
                    ) : services.length === 0 ? (
                      <div className='bg-slate-800 border border-slate-700 rounded-xl p-12 text-center'>
                        <div className='w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                          <span className='text-4xl'>📋</span>
                        </div>
                        <h3 className='text-xl font-bold text-white mb-2'>Aucun service</h3>
                        <p className='text-slate-400'>Creez votre premier service pour cette categorie</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {services.map((service) => (
                          <motion.div
                            key={service._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition'
                          >
                            <div className='flex items-center gap-3 mb-4'>
                              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl'>
                                {service.icon}
                              </div>
                              <div className='flex-1'>
                                <h3 className='text-lg font-bold text-white'>{service.name}</h3>
                                {service.basePrice > 0 && (
                                  <p className='text-sm text-green-400'>{service.basePrice} DZD</p>
                                )}
                              </div>
                            </div>

                            <p className='text-sm text-slate-400 mb-4 line-clamp-2'>{service.description}</p>

                            <div className='flex items-center gap-2 text-xs text-slate-500 mb-4'>
                              <span>{service.questions?.length || 0} questions</span>
                              {service.estimatedDuration && (
                                <>
                                  <span>•</span>
                                  <span>{service.estimatedDuration}</span>
                                </>
                              )}
                            </div>

                            <div className='flex gap-2'>
                              <button
                                onClick={() => handleEditService(service)}
                                className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition'
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDeleteService(service._id)}
                                className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition'
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
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
                <ChatSection />
              </motion.div>
            )}

            {/* Partner Requests Tab */}
            {activeTab === 'partners' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Demandes de Partenariat</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchPartnerRequests()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Toutes
                    </button>
                    <button
                      onClick={() => fetchPartnerRequests('pending')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => fetchPartnerRequests('approved')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Approuvees
                    </button>
                    <button
                      onClick={() => fetchPartnerRequests('rejected')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      Rejetees
                    </button>
                  </div>
                </div>

                {loadingPartners ? (
                  <div className="text-center py-12 text-white">Chargement...</div>
                ) : partnerRequests.length === 0 ? (
                  <div className="bg-slate-700 p-8 rounded-lg text-center text-gray-400">
                    Aucune demande de partenariat
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {partnerRequests.map((request) => (
                      <div key={request._id} className="bg-slate-700 p-6 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-3">
                              <h3 className="text-2xl font-bold text-white mb-2">👤 {request.fullName}</h3>
                              <div className="flex items-center gap-2 text-lg">
                                <span className="text-blue-400">📧 Email de contact:</span>
                                <a 
                                  href={`mailto:${request.email}`}
                                  className="text-blue-300 hover:text-blue-200 underline font-medium"
                                >
                                  {request.email}
                                </a>
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                ℹ️ Utilisez cet email pour contacter le candidat (pas de compte utilisateur)
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {request.status === 'pending' ? '⏳ En attente' :
                                 request.status === 'approved' ? '✅ Approuve' :
                                 '❌ Rejete'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedRequest(selectedRequest?._id === request._id ? null : request)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                              {selectedRequest?._id === request._id ? 'Fermer' : 'Details'}
                            </button>
                          </div>
                        </div>

                        {selectedRequest?._id === request._id && (
                          <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Age:</span>
                                <span className="ml-2 text-white">{request.age} ans</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Personnalite:</span>
                                <span className="ml-2 text-white">{request.personality}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Domaine:</span>
                                <span className="ml-2 text-white">{request.domain}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Experience:</span>
                                <span className="ml-2 text-white">{request.experience}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Tarification:</span>
                                <span className="ml-2 text-white">{request.pricingModel} - {request.priceValue}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Disponibilite:</span>
                                <span className="ml-2 text-white">{request.availability || 'Non specifie'}</span>
                              </div>
                            </div>

                            {request.motivation && (
                              <div>
                                <span className="text-gray-400 block mb-1">Motivation:</span>
                                <p className="text-white bg-slate-800 p-3 rounded">{request.motivation}</p>
                              </div>
                            )}

                            {request.message && (
                              <div>
                                <span className="text-gray-400 block mb-1">Message:</span>
                                <p className="text-white bg-slate-800 p-3 rounded">{request.message}</p>
                              </div>
                            )}

                            {request.cvUrl && (
                              <div className="bg-slate-800 p-4 rounded-lg">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  📄 CV du Candidat
                                </h4>
                                <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                  <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(request.cvUrl)}&embedded=true`}
                                    className="w-full h-full border-0"
                                    title="CV Preview"
                                  />
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <a
                                    href={request.cvUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm"
                                  >
                                    � Ouvrir dans un nouvel onglet
                                  </a>
                                  <a
                                    href={request.cvUrl}
                                    download
                                    className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
                                  >
                                    💾 Telecharger le CV
                                  </a>
                                </div>
                              </div>
                            )}

                            {request.reviewedBy && (
                              <div className="text-sm text-gray-400">
                                Traite par {request.reviewedBy.name} le {new Date(request.reviewedAt).toLocaleDateString()}
                              </div>
                            )}

                            {request.rejectionReason && (
                              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                                <span className="text-red-400 font-medium">Raison du rejet:</span>
                                <p className="text-red-300 mt-1">{request.rejectionReason}</p>
                              </div>
                            )}

                            {request.notes && (
                              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                                <span className="text-blue-400 font-medium">Notes:</span>
                                <p className="text-blue-300 mt-1">{request.notes}</p>
                              </div>
                            )}

                            {request.status === 'pending' && (
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => {
                                    const notes = prompt('Notes (optionnel):');
                                    handleApprovePartner(request._id, notes || '');
                                  }}
                                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                                >
                                  ✅ Approuver
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Raison du rejet (obligatoire):');
                                    if (reason) handleRejectPartner(request._id, reason);
                                  }}
                                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                                >
                                  ❌ Rejeter
                                </button>
                              </div>
                            )}

                            {request.status === 'approved' && (
                              <div className="mt-4">
                                <a
                                  href={`mailto:${request.email}?subject=${encodeURIComponent('🎉 Felicitations ! Votre candidature a ete acceptee - Do IT')}&body=${encodeURIComponent(`Bonjour ${request.fullName},\n\nNous avons le plaisir de vous informer que votre candidature pour devenir partenaire de Do IT a ete acceptee !\n\n✅ Votre profil correspond parfaitement a nos attentes et nous sommes ravis de vous compter parmi nos partenaires.\n\nProchaines etapes :\n- Nous allons vous contacter prochainement pour finaliser votre integration\n- Vous recevrez les informations necessaires pour commencer a travailler avec nous\n- Notre equipe sera a votre disposition pour toute question\n\nNous sommes impatients de collaborer avec vous !\n\nCordialement,\nL'equipe Do IT\n\nPS: N'hesitez pas a nous contacter si vous avez des questions.`)}`}
                                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                                >
                                  📧 Envoyer l'email d'acceptation
                                </a>
                              </div>
                            )}

                            {request.status === 'rejected' && request.rejectionReason && (
                              <div className="mt-4">
                                <a
                                  href={`mailto:${request.email}?subject=${encodeURIComponent('Reponse a votre candidature - Do IT')}&body=${encodeURIComponent(`Bonjour ${request.fullName},\n\nNous vous remercions pour l'interet que vous portez a notre plateforme Do IT et pour le temps consacre a votre candidature.\n\nApres etude approfondie de votre profil, nous sommes au regret de vous informer que nous ne pouvons pas donner suite favorable a votre demande de partenariat pour le moment.\n\nRaison :\n${request.rejectionReason}\n\nCependant, nous vous encourageons vivement a postuler de nouveau dans le futur si votre situation evolue. Nous conserverons votre dossier dans notre base de donnees.\n\nNous vous souhaitons beaucoup de succes dans vos projets professionnels.\n\nCordialement,\nL'equipe Do IT`)}`}
                                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                                >
                                  📧 Envoyer l'email de refus
                                </a>
                              </div>
                            )}

                            {user?.role === 'superadmin' && (
                              <button
                                onClick={() => handleDeletePartner(request._id)}
                                className="w-full mt-2 px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition text-sm"
                              >
                                🗑️ Supprimer definitivement
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className='mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition'
                >
                  {showCategoryForm ? '✕ Annuler' : '+ Nouvelle Categorie'}
                </button>

                {showCategoryForm && (
                  <form onSubmit={editingCategoryId ? handleCategoryUpdate : handleCategorySubmit} className='bg-slate-700 p-6 rounded-lg mb-6 border border-slate-600 space-y-4 max-w-2xl'>
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Nom de la categorie</label>
                      <input
                        type='text'
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                        placeholder='Ex: Menage'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-semibold mb-2'>Description</label>
                      <textarea
                        required
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                        className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                        rows='3'
                        placeholder='Description detaillee...'
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-sm font-semibold mb-2'>Icone</label>
                        <input
                          type='text'
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                          className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-2xl text-center'
                          placeholder='🏠'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold mb-2'>Couleur</label>
                        <input
                          type='color'
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                          className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg cursor-pointer'
                        />
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className='border-2 border-dashed border-slate-500 rounded-lg p-6 text-center'>
                      {imagePreview ? (
                        <div className='space-y-4'>
                          <div className='relative'>
                            <img src={imagePreview} alt='Preview' className='w-full h-48 object-cover rounded-lg' />
                            <div className='absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center'>
                              <div className='text-center'>
                                <p className='text-white font-semibold text-lg'>✓ Image Selectionnee</p>
                              </div>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <label className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer transition'>
                              Changer l'image
                              <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className='hidden'
                              />
                            </label>
                            <button
                              type='button'
                              onClick={clearImagePreview}
                              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition'
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className='flex flex-col items-center justify-center cursor-pointer py-6'>
                          <Upload size={40} className='text-slate-400 mb-2' />
                          <p className='text-white font-semibold mb-1'>Cliquez ou glissez une image</p>
                          <p className='text-slate-400 text-sm'>PNG, JPG, GIF jusqu'a 5MB</p>
                          <input
                            type='file'
                            accept='image/*'
                            onChange={handleImageChange}
                            className='hidden'
                          />
                        </label>
                      )}
                    </div>

                    <div className='flex gap-3'>
                      <button type='submit' disabled={loading} className='flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50'>
                        {loading ? 'En cours...' : editingCategoryId ? 'Mettre a jour' : 'Creer la Categorie'}
                      </button>
                      {editingCategoryId && (
                        <button type='button' onClick={handleCancelEdit} className='px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition'>
                          Annuler
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {categories.map((cat) => (
                    <div key={cat._id} className='bg-slate-700 border border-slate-600 rounded-lg overflow-hidden hover:border-blue-500 transition'>
                      {cat.image && (
                        <img src={cat.image} alt={cat.name} className='w-full h-40 object-cover' />
                      )}
                      <div className='p-4'>
                        <h3 className='font-bold text-lg mb-2'>{cat.icon} {cat.name}</h3>
                        <p className='text-sm text-slate-400 mb-4 line-clamp-2'>{cat.description}</p>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition'
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className='flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition'
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Super Admins Tab */}
            {activeTab === 'superadmins' && user?.role === 'superadmin' && (
              <div>
                <button
                  onClick={() => setShowSuperAdminForm(!showSuperAdminForm)}
                  className='mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition'
                >
                  {showSuperAdminForm ? '✕ Annuler' : '+ Nouveau Super Admin'}
                </button>

                {showSuperAdminForm && (
                  <form onSubmit={handleSuperAdminSubmit} className='bg-slate-700 p-6 rounded-lg mb-6 border border-slate-600 space-y-4 max-w-md'>
                    <input
                      type='text'
                      required
                      value={superAdminForm.name}
                      onChange={(e) => setSuperAdminForm({...superAdminForm, name: e.target.value})}
                      className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                      placeholder='Nom'
                    />
                    <input
                      type='email'
                      required
                      value={superAdminForm.email}
                      onChange={(e) => setSuperAdminForm({...superAdminForm, email: e.target.value})}
                      className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                      placeholder='Email'
                    />
                    <input
                      type='password'
                      required
                      minLength='6'
                      value={superAdminForm.password}
                      onChange={(e) => setSuperAdminForm({...superAdminForm, password: e.target.value})}
                      className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                      placeholder='Mot de passe (min 6 caracteres)'
                    />
                    <button type='submit' disabled={loading} className='w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50'>
                      {loading ? 'Creation en cours...' : 'Creer Super Admin'}
                    </button>
                  </form>
                )}

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-slate-700 border-b border-slate-600'>
                        <th className='px-6 py-3 text-left'>Nom</th>
                        <th className='px-6 py-3 text-left'>Email</th>
                        <th className='px-6 py-3 text-left'>Date de creation</th>
                        <th className='px-6 py-3 text-center'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {superAdmins.map((admin) => (
                        <tr key={admin._id} className='bg-slate-750 border-b border-slate-600 hover:bg-slate-700 transition'>
                          <td className='px-6 py-3'>{admin.name}</td>
                          <td className='px-6 py-3'>{admin.email}</td>
                          <td className='px-6 py-3'>{new Date(admin.createdAt).toLocaleDateString('fr-FR')}</td>
                          <td className='px-6 py-3 text-center'>
                            <button
                              onClick={() => handleDeleteSuperAdmin(admin._id)}
                              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition'
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className='bg-slate-700 p-6 rounded-lg border border-slate-600'>
                <h2 className='text-2xl font-semibold mb-4'>Configuration Generale</h2>
                <p className='text-slate-400'>Les parametres seront disponibles prochainement...</p>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <CommentsModeration />
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className='space-y-6'>
                {loading ? (
                  <div className='flex justify-center py-12'>
                    <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : (
                  <>
                    {/* Stats Cards Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                      {/* Total Comments */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center'>
                            <MessageSquare className='text-blue-400' size={24} />
                          </div>
                          <TrendingUp className='text-blue-400' size={20} />
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>Total Commentaires</p>
                        <p className='text-4xl font-bold text-white'>{stats.totalComments}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-blue-400 font-semibold'>Tous statuts</span>
                        </div>
                      </motion.div>

                      {/* Pending Comments */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center'>
                            <Clock className='text-yellow-400' size={24} />
                          </div>
                          <Activity className='text-yellow-400' size={20} />
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>En Attente</p>
                        <p className='text-4xl font-bold text-white'>{stats.pendingComments}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-yellow-400 font-semibold'>A traiter</span>
                        </div>
                      </motion.div>

                      {/* Approved Comments */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center'>
                            <CheckCircle className='text-green-400' size={24} />
                          </div>
                          <Star className='text-green-400' size={20} />
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>Approuves</p>
                        <p className='text-4xl font-bold text-white'>{stats.approvedComments}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-green-400 font-semibold'>
                            {stats.totalComments > 0 
                              ? `${Math.round((stats.approvedComments / stats.totalComments) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                      </motion.div>

                      {/* Rejected Comments */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-red-500/30 rounded-lg flex items-center justify-center'>
                            <XCircle className='text-red-400' size={24} />
                          </div>
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>Rejetes</p>
                        <p className='text-4xl font-bold text-white'>{stats.rejectedComments}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-red-400 font-semibold'>
                            {stats.totalComments > 0 
                              ? `${Math.round((stats.rejectedComments / stats.totalComments) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                      </motion.div>

                      {/* Total Tasks */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center'>
                            <Briefcase className='text-purple-400' size={24} />
                          </div>
                          <Activity className='text-purple-400' size={20} />
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>Total Taches</p>
                        <p className='text-4xl font-bold text-white'>{stats.totalTasks}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-purple-400 font-semibold'>Demandes recues</span>
                        </div>
                      </motion.div>

                      {/* Pending Tasks */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className='bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='w-12 h-12 bg-amber-500/30 rounded-lg flex items-center justify-center'>
                            <Clock className='text-amber-400' size={24} />
                          </div>
                          <Activity className='text-amber-400' size={20} />
                        </div>
                        <p className='text-slate-400 text-sm mb-1'>Taches en Attente</p>
                        <p className='text-4xl font-bold text-white'>{stats.pendingTasks}</p>
                        <div className='mt-3 flex items-center gap-2'>
                          <span className='text-xs text-amber-400 font-semibold'>
                            {stats.totalTasks > 0 
                              ? `${Math.round((stats.pendingTasks / stats.totalTasks) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Secondary Stats */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Categories */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6'
                      >
                        <div className='flex items-center gap-4 mb-4'>
                          <div className='w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
                            <LayoutGrid className='text-white' size={28} />
                          </div>
                          <div>
                            <p className='text-3xl font-bold text-white'>{categories.length}</p>
                            <p className='text-slate-400 text-sm'>Categories</p>
                          </div>
                        </div>
                        <div className='h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full' />
                      </motion.div>

                      {/* Super Admins */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6'
                      >
                        <div className='flex items-center gap-4 mb-4'>
                          <div className='w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center'>
                            <Users className='text-white' size={28} />
                          </div>
                          <div>
                            <p className='text-3xl font-bold text-white'>{superAdmins.length}</p>
                            <p className='text-slate-400 text-sm'>Super Admins</p>
                          </div>
                        </div>
                        <div className='h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full' />
                      </motion.div>

                      {/* Approval Rate */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6'
                      >
                        <div className='flex items-center gap-4 mb-4'>
                          <div className='w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center'>
                            <TrendingUp className='text-white' size={28} />
                          </div>
                          <div>
                            <p className='text-3xl font-bold text-white'>
                              {stats.totalComments > 0 
                                ? `${Math.round((stats.approvedComments / stats.totalComments) * 100)}%`
                                : '0%'}
                            </p>
                            <p className='text-slate-400 text-sm'>Taux d'approbation</p>
                          </div>
                        </div>
                        <div className='h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full' />
                      </motion.div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className='bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6'
                    >
                      <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                        <Activity className='text-orange-400' size={24} />
                        Activite Recente
                      </h3>
                      {stats.recentActivity.length > 0 ? (
                        <div className='space-y-3'>
                          {stats.recentActivity.map((activity, index) => (
                            <motion.div
                              key={activity._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.9 + index * 0.1 }}
                              className='flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition'
                            >
                              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                                {activity.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-white font-medium truncate'>{activity.user?.name || 'Utilisateur'}</p>
                                <p className='text-slate-400 text-sm truncate'>{activity.text?.substring(0, 50)}...</p>
                              </div>
                              <div className='flex items-center gap-2'>
                                {activity.status === 'approved' && (
                                  <span className='px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30'>
                                    Approuve
                                  </span>
                                )}
                                {activity.status === 'pending' && (
                                  <span className='px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30'>
                                    En attente
                                  </span>
                                )}
                                {activity.status === 'rejected' && (
                                  <span className='px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30'>
                                    Rejete
                                  </span>
                                )}
                                <div className='flex gap-0.5'>
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={`${
                                        i < activity.rating
                                          ? 'fill-orange-400 text-orange-400'
                                          : 'text-slate-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-slate-400 text-center py-8'>Aucune activite recente</p>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
