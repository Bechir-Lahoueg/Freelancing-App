import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    tasks: { total: 0, pending: 0, completed: 0 },
    invoices: { total: 0, paid: 0, pending: 0 },
    revenue: { total: 0, paid: 0, pending: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Récupérer les stats personnelles
      const statsRes = await axios.get('http://localhost:5000/api/users/stats/personal', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(statsRes.data);

      // Récupérer les tâches et factures
      const [tasksRes, invoicesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/api/invoices', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setTasks(tasksRes.data.slice(0, 5)); // 5 dernières tâches
      setInvoices(invoicesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'En attente',
      'in-progress': 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenue, {user?.name} 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Voici un aperçu de vos demandes d'aide
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tâches</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.tasks.total}</p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.tasks.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Complétées</p>
                  <p className="text-3xl font-bold text-green-600">{stats.tasks.completed}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenu Total</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(stats.revenue.total).toLocaleString()} DT</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-8 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Nouvelle demande d'aide</h2>
            <p className="mb-6">Besoin d'aide pour un devoir ou un projet ? Créez une nouvelle demande maintenant !</p>
            <Link
              to="/new-task"
              className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Créer une demande
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dernières tâches */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Dernières demandes</h2>
                <Link to="/history" className="text-primary hover:text-secondary text-sm font-medium">
                  Voir tout →
                </Link>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune demande pour le moment</p>
                  <Link to="/new-task" className="text-primary hover:text-secondary font-medium mt-2 inline-block">
                    Créer votre première demande
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{task.taskType}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{task.price} DZD</p>
                          <p className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières factures */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Factures récentes</h2>
              </div>

              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune facture</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{invoice.totalAmount} DZD</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
