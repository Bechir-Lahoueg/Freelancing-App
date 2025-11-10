import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    universityYear: user?.universityYear || 'L1',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        universityYear: formData.universityYear
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData);
      login(data, data.token);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
                >
                  Modifier
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {/* Avatar */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-5xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année universitaire
                  </label>
                  <select
                    name="universityYear"
                    value={formData.universityYear}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="L1">L1 (Licence 1)</option>
                    <option value="L2">L2 (Licence 2)</option>
                    <option value="L3">L3 (Licence 3)</option>
                    <option value="M1">M1 (Master 1)</option>
                    <option value="M2">M2 (Master 2)</option>
                    <option value="Doctorat">Doctorat</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Changer le mot de passe (optionnel)
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Laisser vide pour ne pas changer"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmer le mot de passe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        universityYear: user?.universityYear || 'L1',
                        password: '',
                        confirmPassword: ''
                      });
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nom complet
                  </label>
                  <p className="text-lg text-gray-900">{user?.name}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Année universitaire
                  </label>
                  <p className="text-lg text-gray-900">{user?.universityYear}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Type d'authentification
                  </label>
                  <p className="text-lg text-gray-900 capitalize">{user?.authType}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Membre depuis
                  </label>
                  <p className="text-lg text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
