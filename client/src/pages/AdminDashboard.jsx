import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CommentsModeration from '../components/CommentsModeration';
import axios from 'axios';
import { Menu, X, LayoutGrid, Users, Settings, BarChart3, LogOut, Upload, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
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

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const menuItems = [
    { id: 'categories', label: 'Catégories', icon: LayoutGrid },
    { id: 'superadmins', label: 'Super Admins', icon: Users, adminOnly: true },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare, adminOnly: true },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 }
  ];

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'superadmins' && user?.role === 'superadmin') {
      fetchSuperAdmins();
    }
  }, [activeTab]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Créer un aperçu de l'image
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
      alert('Catégorie créée avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
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
    // Afficher l'image existante en aperçu
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
      alert('Catégorie mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour: ' + (error.response?.data?.message || error.message));
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
      alert('Super admin créé avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + (error.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuperAdmin = async (id) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20'>
      <Navbar />
      
      <div className='flex h-[calc(100vh-80px)]'>
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
          {/* Sidebar Header */}
          <div className='p-4 border-b border-slate-700 flex items-center justify-between'>
            {sidebarOpen && <h2 className='font-bold text-lg'>Admin Panel</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='p-1 hover:bg-slate-700 rounded-lg transition'
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className='flex-1 p-4 space-y-2'>
            {menuItems.map((item) => {
              if (item.adminOnly && user?.role !== 'superadmin') return null;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title={item.label}
                >
                  <IconComponent size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className='p-4 border-t border-slate-700'>
            {sidebarOpen ? (
              <div className='mb-4 p-3 bg-slate-700 rounded-lg'>
                <p className='text-sm font-semibold'>{user?.name}</p>
                <p className='text-xs text-slate-400'>{user?.email}</p>
                <p className='text-xs text-blue-400 mt-1'>{user?.role}</p>
              </div>
            ) : (
              <div className='mb-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto'>
                <span className='text-sm font-bold'>{user?.name?.charAt(0)}</span>
              </div>
            )}
            <button
              onClick={logout}
              className='w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition'
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-auto'>
          <div className='p-8'>
            {/* Content Header */}
            <div className='mb-8'>
              {activeTab === 'categories' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Catégories</h1>
                  <p className='text-slate-400'>Gestion des catégories de services</p>
                </>
              )}
              {activeTab === 'superadmins' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Super Admins</h1>
                  <p className='text-slate-400'>Gestion des administrateurs</p>
                </>
              )}
              {activeTab === 'settings' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Paramètres</h1>
                  <p className='text-slate-400'>Configuration générale</p>
                </>
              )}
              {activeTab === 'stats' && (
                <>
                  <h1 className='text-4xl font-bold mb-2'>Statistiques</h1>
                  <p className='text-slate-400'>Aperçu des performances</p>
                </>
              )}
            </div>

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className='mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition'
                >
                  {showCategoryForm ? '✕ Annuler' : '+ Nouvelle Catégorie'}
                </button>

                {showCategoryForm && (
                  <form onSubmit={editingCategoryId ? handleCategoryUpdate : handleCategorySubmit} className='bg-slate-700 p-6 rounded-lg mb-6 border border-slate-600 space-y-4 max-w-2xl'>
                    <div>
                      <label className='block text-sm font-semibold mb-2'>Nom de la catégorie</label>
                      <input
                        type='text'
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        className='w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400'
                        placeholder='Ex: Ménage'
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
                        placeholder='Description détaillée...'
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-sm font-semibold mb-2'>Icône</label>
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
                                <p className='text-white font-semibold text-lg'>✓ Image Sélectionnée</p>
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
                          <p className='text-slate-400 text-sm'>PNG, JPG, GIF jusqu'à 5MB</p>
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
                        {loading ? 'En cours...' : editingCategoryId ? 'Mettre à jour' : 'Créer la Catégorie'}
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
                      placeholder='Mot de passe (min 6 caractères)'
                    />
                    <button type='submit' disabled={loading} className='w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition disabled:opacity-50'>
                      {loading ? 'Création en cours...' : 'Créer Super Admin'}
                    </button>
                  </form>
                )}

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-slate-700 border-b border-slate-600'>
                        <th className='px-6 py-3 text-left'>Nom</th>
                        <th className='px-6 py-3 text-left'>Email</th>
                        <th className='px-6 py-3 text-left'>Date de création</th>
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
                <h2 className='text-2xl font-semibold mb-4'>Configuration Générale</h2>
                <p className='text-slate-400'>Les paramètres seront disponibles prochainement...</p>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <CommentsModeration />
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='bg-slate-700 p-6 rounded-lg border border-slate-600'>
                  <p className='text-slate-400 text-sm'>Total Catégories</p>
                  <p className='text-4xl font-bold text-blue-400'>{categories.length}</p>
                </div>
                <div className='bg-slate-700 p-6 rounded-lg border border-slate-600'>
                  <p className='text-slate-400 text-sm'>Total Super Admins</p>
                  <p className='text-4xl font-bold text-green-400'>{superAdmins.length}</p>
                </div>
                <div className='bg-slate-700 p-6 rounded-lg border border-slate-600'>
                  <p className='text-slate-400 text-sm'>Votre Rôle</p>
                  <p className='text-2xl font-bold text-purple-400 capitalize'>{user?.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
