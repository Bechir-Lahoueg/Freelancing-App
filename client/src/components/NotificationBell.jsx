import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('🔔 NotificationBell rendering, user:', user);

  // Seulement pour les admins et superadmins
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    console.log('❌ User not admin/superadmin, hiding bell. Role:', user?.role);
    return null;
  }

  console.log('✅ User is admin/superadmin, showing bell');

  useEffect(() => {
    fetchNotifications();
    // Refresh toutes les 10 secondes
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔔 Fetching notifications...');
      const response = await axios.get(
        `http://localhost:5000/api/notifications`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('✅ Notifications fetched:', response.data);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error.response?.status, error.response?.data || error.message);
      // Continuer avec un array vide au lieu de crash
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Erreur marking as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marquer comme lue
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
    
    // Naviguer vers le dashboard admin/commentaires
    navigate('/admin/dashboard');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {notifications.length > 9 ? '9+' : notifications.length}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 sticky top-0">
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-sm opacity-90">
                {notifications.length} commentaire{notifications.length > 1 ? 's' : ''} en attente
              </p>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 cursor-pointer transition ${
                      notif.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`mt-1 p-2 rounded-full ${
                        notif.type === 'comment_created' 
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {notif.type === 'comment_created' ? '📝' : '🗑️'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notif.type === 'comment_created' 
                            ? 'Nouveau Commentaire' 
                            : 'Commentaire Supprimé'}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {notif.message}
                        </p>
                        {notif.comment && (
                          <p className="text-gray-500 text-xs mt-2 italic">
                            "{notif.comment.text.substring(0, 50)}..."
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
