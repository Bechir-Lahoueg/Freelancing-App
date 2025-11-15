import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell({ scrolled = false }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('🔔 NotificationBell rendering, user:', user);

  // Afficher pour tous les utilisateurs authentifiés
  if (!user) {
    console.log('❌ No user, hiding bell');
    return null;
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket && user) {
      console.log('🔔 Setting up socket listeners for notifications');
      
      // Écouter les nouvelles notifications
      socket.on('notification', (notification) => {
        console.log('🔔 Nouvelle notification reçue:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher une notification navigateur si autorisé
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      });

      // Pour les admins, écouter aussi les notifications admin
      if (user.role === 'admin' || user.role === 'superadmin') {
        socket.on('admin-notification', (notification) => {
          console.log('🔔 Notification admin reçue:', notification);
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      }

      return () => {
        socket.off('notification');
        socket.off('admin-notification');
      };
    }
  }, [socket, user]);

  // Demander la permission pour les notifications navigateur
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
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
    
    // Naviguer selon le type de notification
    switch (notification.type) {
      case 'partner_request':
        navigate('/admin/dashboard');
        // Activer l'onglet partners si possible
        break;
      case 'task_created':
      case 'task_updated':
      case 'task_completed':
        navigate('/dashboard');
        break;
      case 'message_received':
        navigate(user.role === 'admin' || user.role === 'superadmin' ? '/admin/dashboard' : '/dashboard');
        break;
      case 'comment_created':
      case 'comment_deleted':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment_created': return '📝';
      case 'comment_deleted': return '🗑️';
      case 'task_created': return '💼';
      case 'task_updated': return '✏️';
      case 'task_completed': return '✅';
      case 'message_received': return '💬';
      case 'partner_request': return '🤝';
      case 'partner_approved': return '✅';
      case 'partner_rejected': return '❌';
      case 'invoice_created': return '📄';
      case 'invoice_paid': return '💰';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    if (type.includes('task')) return 'bg-blue-100 text-blue-600';
    if (type.includes('message')) return 'bg-purple-100 text-purple-600';
    if (type.includes('partner')) return 'bg-green-100 text-green-600';
    if (type.includes('invoice')) return 'bg-yellow-100 text-yellow-600';
    if (type.includes('comment')) return 'bg-orange-100 text-orange-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2 rounded-full transition ${
          scrolled 
            ? 'text-gray-800 hover:bg-gray-100' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        <Bell size={24} className={unreadCount > 0 ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[500px] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 sticky top-0 rounded-t-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <p className="text-sm opacity-90">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''} sur {notifications.length}
                  </p>
                </div>
              </div>
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
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`mt-1 p-2 rounded-full ${getNotificationColor(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {notif.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          {notif.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(notif.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
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
