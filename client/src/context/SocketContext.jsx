import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket doit etre utilise dans un SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      // Connexion au serveur Socket.IO
      const API_URL = import.meta.env.VITE_API_URL || 'https://freelancing-app-mdgw.onrender.com';
      const newSocket = io(API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connecte');
        setIsConnected(true);
        // Notifier le serveur que l'utilisateur est en ligne
        newSocket.emit('user:online', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket.IO deconnecte');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.IO:', error);
        setIsConnected(false);
      });

      // Ecouter les changements de statut des utilisateurs
      newSocket.on('user:status', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user]);

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('conversation:join', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('conversation:leave', conversationId);
    }
  };

  const sendMessage = (data) => {
    if (socket && isConnected) {
      socket.emit('message:send', data);
    }
  };

  const markAsRead = (data) => {
    if (socket && isConnected) {
      socket.emit('message:read', data);
    }
  };

  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing:start', { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing:stop', { conversationId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    isUserOnline
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
