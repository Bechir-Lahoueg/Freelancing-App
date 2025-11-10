import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NewTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taskType: 'rédaction',
    title: '',
    description: '',
    options: {
      level: 'intermédiaire',
      deadline: '1 semaine',
      complexity: 'moyen',
      pages: 1
    }
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculer le prix en temps réel
  const calculatePrice = (type, opts) => {
    let basePrice = 50;

    const taskPrices = {
      'rédaction': 50,
      'codage': 100,
      'présentation': 60,
      'rapport': 70,
      'recherche': 40,
      'traduction': 45,
      'autre': 50
    };

    basePrice = taskPrices[type] || 50;

    const levelMultiplier = {
      'débutant': 1,
      'intermédiaire': 1.3,
      'avancé': 1.6,
      'expert': 2
    };

    const deadlineMultiplier = {
      '24h': 2,
      '48h': 1.5,
      '1 semaine': 1,
      '2 semaines': 0.9,
      '1 mois': 0.8
    };

    const complexityMultiplier = {
      'simple': 1,
      'moyen': 1.3,
      'complexe': 1.6,
      'très complexe': 2
    };

    let price = basePrice;
    price *= levelMultiplier[opts.level] || 1;
    price *= deadlineMultiplier[opts.deadline] || 1;
    price *= complexityMultiplier[opts.complexity] || 1;
    price *= opts.pages || 1;

    return Math.round(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('options.')) {
      const optionName = name.split('.')[1];
      const newOptions = {
        ...formData.options,
        [optionName]: optionName === 'pages' ? parseInt(value) : value
      };
      setFormData({ ...formData, options: newOptions });
      setCalculatedPrice(calculatePrice(formData.taskType, newOptions));
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'taskType') {
        setCalculatedPrice(calculatePrice(value, formData.options));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', formData);
      alert('Demande créée avec succès !');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nouvelle demande d'aide
            </h1>
            <p className="text-gray-600 mb-8">
              Remplissez le formulaire pour créer votre demande
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type de tâche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de tâche *
                </label>
                <select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="rédaction">Rédaction</option>
                  <option value="codage">Codage / Programmation</option>
                  <option value="présentation">Présentation</option>
                  <option value="rapport">Rapport</option>
                  <option value="recherche">Recherche</option>
                  <option value="traduction">Traduction</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ex: Rédaction d'un rapport de stage"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Décrivez en détail votre besoin..."
                ></textarea>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Niveau */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau
                  </label>
                  <select
                    name="options.level"
                    value={formData.options.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Délai */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai souhaité
                  </label>
                  <select
                    name="options.deadline"
                    value={formData.options.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="24h">24 heures (urgent)</option>
                    <option value="48h">48 heures</option>
                    <option value="1 semaine">1 semaine</option>
                    <option value="2 semaines">2 semaines</option>
                    <option value="1 mois">1 mois</option>
                  </select>
                </div>

                {/* Complexité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complexité
                  </label>
                  <select
                    name="options.complexity"
                    value={formData.options.complexity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="simple">Simple</option>
                    <option value="moyen">Moyen</option>
                    <option value="complexe">Complexe</option>
                    <option value="très complexe">Très complexe</option>
                  </select>
                </div>

                {/* Nombre de pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de pages
                  </label>
                  <input
                    type="number"
                    name="options.pages"
                    value={formData.options.pages}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Prix estimé */}
              <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Prix estimé</p>
                    <p className="text-4xl font-bold">{calculatedPrice} DZD</p>
                    <p className="text-sm opacity-75 mt-2">
                      TVA incluse (19%)
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">💰</div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewTask;
