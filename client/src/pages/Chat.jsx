import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  User, 
  Circle,
  CheckCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket, isConnected, joinConversation, leaveConversation, isUserOnline } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Ecouter les nouveaux messages via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('message:received', ({ message, conversationId }) => {
        if (selectedConversation?._id === conversationId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          
          // Marquer comme lu automatiquement
          markAsRead(conversationId);
        } else {
          // Mettre a jour le badge de notification
          setConversations(prev => 
            prev.map(conv => 
              conv._id === conversationId
                ? { ...conv, unreadCount: { ...conv.unreadCount, [user._id]: (conv.unreadCount[user._id] || 0) + 1 } }
                : conv
            )
          );
        }
      });

      socket.on('user:typing', ({ userId, conversationId }) => {
        if (selectedConversation?._id === conversationId && userId !== user._id) {
          setTypingUsers(prev => new Set(prev).add(userId));
        }
      });

      socket.on('user:stop-typing', ({ userId }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      socket.on('messages:read', ({ userId }) => {
        if (userId !== user._id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.senderId._id === user._id ? { ...msg, isRead: true } : msg
            )
          );
        }
      });

      return () => {
        socket.off('message:received');
        socket.off('user:typing');
        socket.off('user:stop-typing');
        socket.off('messages:read');
      };
    }
  }, [socket, selectedConversation, user]);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://freelancing-app-mdgw.onrender.com/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://freelancing-app-mdgw.onrender.com/api/chat/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
      
      // Marquer les messages comme lus
      markAsRead(conversationId);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://freelancing-app-mdgw.onrender.com/api/chat/conversations/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mettre a jour l'UI
      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversationId
            ? { ...conv, unreadCount: { ...conv.unreadCount, [user._id]: 0 } }
            : conv
        )
      );
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    if (selectedConversation?._id) {
      leaveConversation(selectedConversation._id);
    }
    
    setSelectedConversation(conversation);
    joinConversation(conversation._id);
    loadMessages(conversation._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://freelancing-app-mdgw.onrender.com/api/chat/conversations/${selectedConversation._id}/messages`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      
      // Le message sera ajoute via Socket.IO
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (selectedConversation && socket) {
      socket.emit('typing:start', { conversationId: selectedConversation._id });
      
      // Clear le timeout precedent
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Arreter le typing apres 2 secondes
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: selectedConversation._id });
      }, 2000);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.userId._id !== user._id);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-150px)] flex overflow-hidden">
          {/* Liste des conversations */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Messages
              </h2>
              {isConnected && (
                <p className="text-xs text-green-600 mt-1">● Connecte</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                conversations.map(conversation => {
                  const other = getOtherParticipant(conversation);
                  const unreadCount = conversation.unreadCount?.[user._id] || 0;
                  const isOnline = isUserOnline(other?.userId._id);

                  return (
                    <motion.div
                      key={conversation._id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 cursor-pointer border-b border-gray-100 ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {other?.userId.name?.[0].toUpperCase()}
                          </div>
                          {isOnline && (
                            <Circle className="w-3 h-3 absolute bottom-0 right-0 text-green-500 fill-green-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {other?.userId.name}
                            </h3>
                            {conversation.lastMessage?.timestamp && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.taskRequestId?.title}
                          </p>
                          
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'Aucun message'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getOtherParticipant(selectedConversation)?.userId.name?.[0].toUpperCase()}
                    </div>
                    {isUserOnline(getOtherParticipant(selectedConversation)?.userId._id) && (
                      <Circle className="w-3 h-3 absolute bottom-0 right-0 text-green-500 fill-green-500" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedConversation)?.userId.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.taskRequestId?.title}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId._id === user._id;
                    const showDate = index === 0 || 
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                            {message.messageType === 'system' ? (
                              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm text-center">
                                {message.content}
                              </div>
                            ) : (
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  <span className="text-xs">
                                    {formatTime(message.createdAt)}
                                  </span>
                                  {isOwn && (
                                    message.isRead ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  
                  {typingUsers.size > 0 && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>En train d'ecrire...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Ecrire un message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Selectionnez une conversation</p>
                  <p className="text-sm mt-2">
                    Choisissez une conversation dans la liste pour commencer a discuter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
