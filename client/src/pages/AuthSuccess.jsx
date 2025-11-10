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
      // Extraire les données utilisateur du token (base64 decode du payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        login({ _id: payload.id }, token);
        navigate('/dashboard');
      } catch (error) {
        console.error('Erreur lors du traitement du token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
