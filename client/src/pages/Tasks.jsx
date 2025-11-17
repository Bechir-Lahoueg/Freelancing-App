import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Tasks() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_URL = 'https://freelancing-app-mdgw.onrender.com/api';
  const token = localStorage.getItem('token');
  const headers = { Authorization: 'Bearer ' + token };

  const category = searchParams.get('category');

  useEffect(() => {
    fetchTasks();
  }, [category, filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/tasks`;
      const params = [];

      if (category) params.push(`category=${category}`);
      if (filter !== 'all') params.push(`status=${filter}`);

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await axios.get(url, { headers });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            {category ? `Tâches - ${category}` : 'Toutes les tâches'}
          </h1>
          <p className="text-slate-400">
            {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} disponible{tasks.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {['all', 'open', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'Toutes' : status === 'open' ? 'Ouvertes' : status === 'in-progress' ? 'En cours' : 'Complétées'}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-400 text-lg">Aucune tâche disponible</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TaskCard task={task} onComment={() => fetchTasks()} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
