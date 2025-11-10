import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, profile
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editData.name,
        email: editData.email
      };

      if (editData.newPassword) {
        if (editData.newPassword !== editData.confirmPassword) {
          setMessage('Les mots de passe ne correspondent pas');
          return;
        }
        updateData.password = editData.newPassword;
      }

      await axios.put(`/api/users/${user._id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage('Profil mis à jour avec succès');
      setEditMode(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessage('Utilisateur supprimé avec succès');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Tableau de Bord Admin
          </h1>
          <p className="text-purple-200">Bienvenue {user?.name}</p>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes('succès')
                ? 'bg-green-500/20 border border-green-500 text-green-200'
                : 'bg-red-500/20 border border-red-500 text-red-200'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {['stats', 'users', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {tab === 'stats'
                ? '📊 Statistiques'
                : tab === 'users'
                ? '👥 Utilisateurs'
                : '⚙️ Mon Profil'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'stats' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Users Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <h3 className="text-slate-300 text-sm font-semibold mb-2">UTILISATEURS</h3>
              <p className="text-4xl font-bold text-white mb-4">{stats.users.total}</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Admins: <span className="text-purple-400">{stats.users.admins}</span></p>
                <p>Super Admins: <span className="text-purple-400">{stats.users.superAdmins}</span></p>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <h3 className="text-slate-300 text-sm font-semibold mb-2">TÂCHES</h3>
              <p className="text-4xl font-bold text-white mb-4">{stats.tasks.total}</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>En attente: <span className="text-yellow-400">{stats.tasks.pending}</span></p>
                <p>Complétées: <span className="text-green-400">{stats.tasks.completed}</span></p>
              </div>
            </div>

            {/* Invoices Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <h3 className="text-slate-300 text-sm font-semibold mb-2">FACTURES</h3>
              <p className="text-4xl font-bold text-white mb-4">{stats.invoices.total}</p>
              <div className="space-y-2 text-sm text-slate-400">
                <p>Payées: <span className="text-green-400">{stats.invoices.paid}</span></p>
                <p>En attente: <span className="text-yellow-400">{stats.invoices.pending}</span></p>
              </div>
            </div>

            {/* Revenue Card - Full Width */}
            <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-slate-300 text-sm font-semibold mb-4">REVENUS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total</p>
                  <p className="text-3xl font-bold text-purple-300">
                    {Math.round(stats.revenue.total).toLocaleString()} DT
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Payés</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Math.round(stats.revenue.paid).toLocaleString()} DT
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">En attente</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {Math.round(stats.revenue.pending).toLocaleString()} DT
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      Date d'inscription
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'superadmin'
                              ? 'bg-red-500/20 text-red-200'
                              : u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-200'
                              : 'bg-blue-500/20 text-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.role !== 'superadmin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="px-3 py-1 bg-red-600/20 text-red-300 rounded hover:bg-red-600/40 transition-colors text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8"
          >
            {!editMode ? (
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Nom</p>
                  <p className="text-white text-lg font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Email</p>
                  <p className="text-white text-lg font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Rôle</p>
                  <p className="text-purple-300 text-lg font-semibold">{user?.role}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Modifier le profil
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    value={editData.newPassword}
                    onChange={(e) =>
                      setEditData({ ...editData, newPassword: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={editData.confirmPassword}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        confirmPassword: e.target.value
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
