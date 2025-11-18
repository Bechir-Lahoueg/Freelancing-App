import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Sauvegarder le token et recuperer les infos utilisateur
      localStorage.setItem('token', token);
      
      // Recuperer les infos utilisateur avec le token
      fetch(`${import.meta.env.VITE_API_URL || 'https://freelancing-app-mdgw.onrender.com'}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(userData => {
        // Connecter l'utilisateur
        login(userData, token);
        
        // Rediriger selon le role
        if (userData.role === 'superadmin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la recuperation du profil:', error);
        navigate('/login');
      });
    } else {
      // Pas de token, rediriger vers login
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
