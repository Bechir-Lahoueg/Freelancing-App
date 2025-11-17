import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';
import { 
  Send, 
  Search,
  Circle,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  MessageCircle,
  Users,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  Archive,
  LogOut,
  CheckCircle2,
  X,
  Image as ImageIcon,
  File as FileIcon,
  Video,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = () => {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, isUserOnline } = useSocket();
  
  const API_URL = import.meta.env.VITE_API_URL || 'https://freelancing-app-mdgw.onrender.com';
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'grouped', 'archived'
  const [expandedClients, setExpandedClients] = useState(new Set());
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'unread', 'client'
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const actionsMenuRef = useRef(null);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Écouter les événements Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('message:received', ({ message, conversationId }) => {
        if (selectedConversation?._id === conversationId) {
          // Éviter les doublons (ne pas ajouter si le message existe déjà)
          setMessages(prev => {
            const exists = prev.some(msg => 
              msg._id === message._id || 
              (msg.content === message.content && 
               msg.senderId._id === message.senderId._id &&
               Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
            );
            if (exists) return prev;
            return [...prev, message];
          });
          scrollToBottom();
          
          // Ne marquer comme lu que si ce n'est pas notre propre message
          if (message.senderId._id !== user._id) {
            markAsRead(conversationId);
          }
        } else {
          // Mettre à jour le compteur de non-lus
          setConversations(prev => 
            prev.map(conv => {
              if (conv._id === conversationId) {
                const currentUnread = conv.unreadCount?.[user._id] || 0;
                return {
                  ...conv,
                  unreadCount: { ...conv.unreadCount, [user._id]: currentUnread + 1 },
                  lastMessage: {
                    content: message.content,
                    senderId: message.senderId,
                    timestamp: message.createdAt
                  }
                };
              }
              return conv;
            })
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

      socket.on('conversation:closed', ({ conversationId, message }) => {
        // Ajouter le message système
        if (selectedConversation?._id === conversationId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          // Mettre à jour l'état de la conversation sélectionnée
          setSelectedConversation(prev => ({
            ...prev,
            status: 'closed'
          }));
        }
        // Mettre à jour la conversation dans la liste
        setConversations(prev =>
          prev.map(conv =>
            conv._id === conversationId ? { ...conv, status: 'closed' } : conv
          )
        );
      });

      socket.on('task:completed', ({ conversationId, action, message }) => {
        // Ajouter le message système
        if (selectedConversation?._id === conversationId) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
          // Mettre à jour l'état de la conversation sélectionnée
          setSelectedConversation(prev => ({
            ...prev,
            taskCompleted: true,
            status: action === 'close_conversation' ? 'completed' : prev.status
          }));
        }
        // Mettre à jour la conversation dans la liste
        setConversations(prev =>
          prev.map(conv =>
            conv._id === conversationId ? { 
              ...conv, 
              taskCompleted: true,
              status: action === 'close_conversation' ? 'completed' : conv.status 
            } : conv
          )
        );
      });

      return () => {
        socket.off('message:received');
        socket.off('user:typing');
        socket.off('user:stop-typing');
        socket.off('messages:read');
        socket.off('conversation:closed');
        socket.off('task:completed');
      };
    }
  }, [socket, selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le menu actions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
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
        `${API_URL}/api/chat/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
      setTimeout(() => scrollToBottom(), 100); // Petit délai pour assurer le rendu
      markAsRead(conversationId);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/chat/conversations/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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
    setShowMobileChat(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    // Optimistic update - Afficher le message immédiatement
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: {
        _id: user._id,
        name: user.name
      },
      conversationId: selectedConversation._id,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: [],
      isSending: true // Indicateur temporaire
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/chat/conversations/${selectedConversation._id}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remplacer le message temporaire par le vrai message du serveur
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? response.data : msg
      ));
      
      // Mettre à jour la liste des conversations
      loadConversations();
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent); // Restaurer le message
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (50MB maximum)');
      return;
    }

    setSelectedFile(file);

    // Créer une prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedConversation) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('token');
      
      // Upload le fichier
      const uploadResponse = await axios.post(
        `${API_URL}/api/chat/conversations/${selectedConversation._id}/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const fileData = uploadResponse.data.file;

      // Envoyer le message avec le fichier
      await axios.post(
        `${API_URL}/api/chat/conversations/${selectedConversation._id}/messages`,
        {
          content: newMessage.trim() || `Fichier partagé: ${fileData.fileName}`,
          messageType: fileData.type,
          fileUrl: fileData.url,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Réinitialiser
      setNewMessage('');
      handleCancelFile();
      loadMessages(selectedConversation._id);
      
    } catch (error) {
      console.error('Erreur envoi fichier:', error);
      alert('Erreur lors de l\'envoi du fichier');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (selectedConversation && socket) {
      socket.emit('typing:start', { conversationId: selectedConversation._id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: selectedConversation._id });
      }, 2000);
    }
  };

  const handleLeaveConversation = async () => {
    if (!confirm('Êtes-vous sûr de vouloir quitter cette conversation ? Elle sera fermée définitivement.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/conversations/${selectedConversation._id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Recharger les conversations pour mettre à jour le statut
      await loadConversations();
      
      // Recharger les messages pour afficher le message système
      // Ne pas désélectionner la conversation pour que l'utilisateur voie le message
      await loadMessages(selectedConversation._id);
      
      // Mettre à jour localement le statut de la conversation sélectionnée
      setSelectedConversation(prev => ({
        ...prev,
        status: 'closed'
      }));
      
      alert('Conversation fermée avec succès. Elle reste visible mais ne peut plus recevoir de messages.');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
      alert(error.response?.data?.message || 'Erreur lors de la fermeture de la conversation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (action) => {
    setActionLoading(true);
    setShowCompleteModal(false);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/conversations/${selectedConversation._id}/complete`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Recharger les conversations
      await loadConversations();
      
      if (action === 'close_conversation') {
        setSelectedConversation(null);
        setMessages([]);
      } else {
        // Recharger les messages pour afficher le message système
        loadMessages(selectedConversation._id);
      }
      
      alert('Tâche marquée comme terminée ! +1 projet complété 🎉');
    } catch (error) {
      console.error('Erreur lors de la complétion:', error);
      alert(error.response?.data?.message || 'Erreur lors de la complétion de la tâche');
    } finally {
      setActionLoading(false);
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

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    const matchSearch = other?.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.taskRequestId?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.conversationCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (viewMode === 'archived') {
      return matchSearch && conv.status === 'archived';
    }
    // Afficher toutes les conversations actives, fermées et complétées
    return matchSearch && (conv.status === 'active' || conv.status === 'closed' || conv.status === 'completed');
  });

  // Grouper les conversations par client
  const groupedByClient = () => {
    const grouped = {};
    filteredConversations.forEach(conv => {
      const other = getOtherParticipant(conv);
      const clientId = other?.userId._id;
      if (!grouped[clientId]) {
        grouped[clientId] = {
          client: other?.userId,
          conversations: []
        };
      }
      grouped[clientId].conversations.push(conv);
    });
    return Object.values(grouped);
  };

  // Trier les conversations
  const sortConversations = (convs) => {
    const sorted = [...convs];
    switch (sortBy) {
      case 'unread':
        return sorted.sort((a, b) => 
          (b.unreadCount?.[user._id] || 0) - (a.unreadCount?.[user._id] || 0)
        );
      case 'client':
        return sorted.sort((a, b) => 
          getOtherParticipant(a)?.userId.name.localeCompare(getOtherParticipant(b)?.userId.name)
        );
      case 'recent':
      default:
        return sorted.sort((a, b) => 
          new Date(b.lastMessage?.timestamp || b.updatedAt) - new Date(a.lastMessage?.timestamp || a.updatedAt)
        );
    }
  };

  const toggleClientExpansion = (clientId) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount?.[user._id] || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-800 rounded-xl overflow-hidden">
      {/* Liste des conversations */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-700`}>
        {/* Header avec filtres modernes */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, code ou demande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"
            />
          </div>

          {/* Tabs de vue */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'all' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                Toutes {filteredConversations.length > 0 && `(${filteredConversations.length})`}
              </div>
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grouped' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Par Client
              </div>
            </button>
            <button
              onClick={() => setViewMode('archived')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'archived' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="recent">Plus récent</option>
              <option value="unread">Non lus d'abord</option>
              <option value="client">Par nom (A-Z)</option>
            </select>
          </div>

          {/* Stats */}
          {totalUnread > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <span className="text-xs text-orange-300">Messages non lus</span>
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">
                {totalUnread}
              </span>
            </div>
          )}
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium mb-1">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune conversation'}
              </p>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'Essayez un autre terme de recherche' : 'Les conversations apparaîtront ici'}
              </p>
            </div>
          ) : viewMode === 'grouped' ? (
            // VUE GROUPÉE PAR CLIENT
            <div className="p-2">
              {groupedByClient().map(({ client, conversations: clientConvs }) => {
                const isExpanded = expandedClients.has(client._id);
                const totalUnreadForClient = clientConvs.reduce((acc, conv) => 
                  acc + (conv.unreadCount?.[user._id] || 0), 0
                );

                return (
                  <div key={client._id} className="mb-2">
                    {/* Header du groupe client */}
                    <div
                      onClick={() => toggleClientExpansion(client._id)}
                      className="flex items-center gap-3 p-3 bg-slate-750 hover:bg-slate-700 rounded-lg cursor-pointer transition group"
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </motion.div>

                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                          {client.name[0].toUpperCase()}
                        </div>
                        {isUserOnline(client._id) && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-750"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {client.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded-full font-medium">
                            {clientConvs.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{client.email}</p>
                      </div>

                      {totalUnreadForClient > 0 && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                          {totalUnreadForClient}
                        </span>
                      )}
                    </div>

                    {/* Conversations du client */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-6 mt-1 space-y-1"
                        >
                          {sortConversations(clientConvs).map(conversation => {
                            const unreadCount = conversation.unreadCount?.[user._id] || 0;
                            const isSelected = selectedConversation?._id === conversation._id;

                            return (
                              <motion.div
                                key={conversation._id}
                                whileHover={{ x: 4 }}
                                onClick={() => handleSelectConversation(conversation)}
                                className={`p-3 rounded-lg cursor-pointer transition border-l-2 ${
                                  isSelected
                                    ? 'bg-slate-700 border-orange-500'
                                    : 'bg-slate-800 hover:bg-slate-750 border-transparent'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-1.5">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-xs text-slate-400">📋</span>
                                    {conversation.conversationCode && (
                                      <span className="text-xs font-mono text-orange-400 font-semibold">
                                        {conversation.conversationCode}
                                      </span>
                                    )}
                                  </div>
                                  {unreadCount > 0 && (
                                    <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">
                                      {unreadCount}
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-white font-medium mb-1 truncate">
                                  {conversation.taskRequestId?.title || 'Sans titre'}
                                </p>

                                {/* Badge de statut fermé/complété */}
                                {(conversation.status === 'closed' || conversation.status === 'completed') && (
                                  <div className="mb-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                      conversation.status === 'completed'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                      {conversation.status === 'completed' ? '✅ Terminée' : '🔒 Fermée'}
                                    </span>
                                  </div>
                                )}

                                {conversation.assignedAgent?.name && (
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-xs text-green-400">👤</span>
                                    <span className="text-xs text-green-400">
                                      {conversation.assignedAgent.name}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400 truncate flex-1 mr-2">
                                    {conversation.lastMessage?.content || 'Aucun message'}
                                  </p>
                                  {conversation.lastMessage?.timestamp && (
                                    <span className="text-xs text-slate-500 flex-shrink-0">
                                      {getRelativeTime(conversation.lastMessage.timestamp)}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            // VUE LISTE NORMALE
            <div className="p-2 space-y-1">
              {sortConversations(filteredConversations).map(conversation => {
                const other = getOtherParticipant(conversation);
                const unreadCount = conversation.unreadCount?.[user._id] || 0;
                const isOnline = isUserOnline(other?.userId._id);
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <motion.div
                    key={conversation._id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-3 cursor-pointer rounded-lg transition border ${
                      isSelected 
                        ? 'bg-slate-700 border-orange-500/50 shadow-lg' 
                        : 'bg-slate-800 hover:bg-slate-750 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                          {other?.userId.name?.[0].toUpperCase()}
                        </div>
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {other?.userId.name}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {conversation.lastMessage?.timestamp && (
                              <span className="text-xs text-slate-400">
                                {getRelativeTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-slate-400 truncate mb-1.5">
                          📝 {conversation.taskRequestId?.title}
                        </p>

                        {/* Badge de statut fermé/complété */}
                        {(conversation.status === 'closed' || conversation.status === 'completed') && (
                          <div className="mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              conversation.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {conversation.status === 'completed' ? '✅ Terminée' : '🔒 Fermée'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-1.5">
                          {conversation.conversationCode && (
                            <span className="text-xs text-orange-400 font-mono font-semibold">
                              📋 {conversation.conversationCode}
                            </span>
                          )}
                          {conversation.assignedAgent?.name && (
                            <span className="text-xs text-green-400">
                              👤 {conversation.assignedAgent.name}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-300 truncate">
                          {conversation.lastMessage?.content || 'Aucun message'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center gap-3 bg-slate-750">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                  {getOtherParticipant(selectedConversation)?.userId.name?.[0].toUpperCase()}
                </div>
                {isUserOnline(getOtherParticipant(selectedConversation)?.userId._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">
                  {getOtherParticipant(selectedConversation)?.userId.name}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <p className="text-slate-400">
                    {isUserOnline(getOtherParticipant(selectedConversation)?.userId._id) ? 'En ligne' : 'Hors ligne'}
                  </p>
                  {selectedConversation.conversationCode && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-orange-400 font-mono">
                        {selectedConversation.conversationCode}
                      </span>
                    </>
                  )}
                  {selectedConversation.assignedAgent?.name && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-green-400">
                        👤 {selectedConversation.assignedAgent.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Menu Actions Admin */}
              <div className="relative" ref={actionsMenuRef}>
                <button 
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showActionsMenu && (user.role === 'admin' || user.role === 'superadmin') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {/* Titre du menu */}
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Actions Administrateur
                        </div>

                        {/* Option: Marquer comme terminé */}
                        {!selectedConversation.taskCompleted && 
                         selectedConversation.status !== 'closed' && 
                         selectedConversation.status !== 'completed' && (
                          <motion.button
                            whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                            onClick={() => {
                              setShowActionsMenu(false);
                              setShowCompleteModal(true);
                            }}
                            disabled={actionLoading}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">Marquer comme terminée</p>
                              <p className="text-xs text-slate-400">+1 projet complété</p>
                            </div>
                          </motion.button>
                        )}

                        {/* Option: Quitter la conversation */}
                        {selectedConversation.status !== 'closed' && 
                         selectedConversation.status !== 'completed' && (
                          <motion.button
                            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            onClick={() => {
                              setShowActionsMenu(false);
                              handleLeaveConversation();
                            }}
                            disabled={actionLoading}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition">
                              <LogOut className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">Quitter la conversation</p>
                              <p className="text-xs text-slate-400">Ferme définitivement</p>
                            </div>
                          </motion.button>
                        )}

                        {/* État: Déjà terminé */}
                        {selectedConversation.taskCompleted && (
                          <div className="px-3 py-2.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <p className="text-xs text-green-400 font-medium">Tâche déjà terminée</p>
                            </div>
                          </div>
                        )}

                        {/* État: Conversation fermée */}
                        {(selectedConversation.status === 'closed' || selectedConversation.status === 'completed') && (
                          <div className="px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg">
                            <div className="flex items-center gap-2">
                              <X className="w-4 h-4 text-slate-400" />
                              <p className="text-xs text-slate-400 font-medium">Conversation fermée</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-850">
              {messages.map((message, index) => {
                const isOwn = message.senderId._id === user._id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {message.messageType === 'system' ? (
                          <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-xs text-center backdrop-blur-sm border border-blue-500/30">
                            {message.content}
                          </div>
                        ) : (
                          <div className="group">
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-sm'
                                  : 'bg-slate-700 text-white rounded-bl-sm'
                              }`}
                            >
                              {/* Affichage selon le type de message */}
                              {message.messageType === 'image' && message.fileUrl ? (
                                <div>
                                  <img 
                                    src={message.fileUrl} 
                                    alt={message.fileName || 'Image'}
                                    className="max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => window.open(message.fileUrl, '_blank')}
                                  />
                                  {message.content && message.content !== `Fichier partagé: ${message.fileName}` && (
                                    <p className="text-sm whitespace-pre-wrap break-words mt-2">
                                      {message.content}
                                    </p>
                                  )}
                                </div>
                              ) : message.messageType === 'video' && message.fileUrl ? (
                                <div>
                                  <video 
                                    controls 
                                    className="max-w-xs rounded-lg mb-2"
                                    src={message.fileUrl}
                                  >
                                    Votre navigateur ne supporte pas la vidéo.
                                  </video>
                                  {message.content && message.content !== `Fichier partagé: ${message.fileName}` && (
                                    <p className="text-sm whitespace-pre-wrap break-words mt-2">
                                      {message.content}
                                    </p>
                                  )}
                                </div>
                              ) : message.messageType === 'audio' && message.fileUrl ? (
                                <div>
                                  <audio controls className="max-w-xs mb-2">
                                    <source src={message.fileUrl} type={message.mimeType} />
                                    Votre navigateur ne supporte pas l'audio.
                                  </audio>
                                  {message.content && message.content !== `Fichier partagé: ${message.fileName}` && (
                                    <p className="text-sm whitespace-pre-wrap break-words mt-2">
                                      {message.content}
                                    </p>
                                  )}
                                </div>
                              ) : message.messageType === 'pdf' && message.fileUrl ? (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 hover:opacity-80 transition"
                                >
                                  <div className={`p-3 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-slate-600'}`}>
                                    <FileText className="w-6 h-6" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium">{message.fileName || 'Document.pdf'}</p>
                                    {message.fileSize && (
                                      <p className="text-xs opacity-75">{(message.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                    )}
                                  </div>
                                </a>
                              ) : message.messageType === 'file' && message.fileUrl ? (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 hover:opacity-80 transition"
                                >
                                  <div className={`p-3 rounded-lg ${isOwn ? 'bg-white/20' : 'bg-slate-600'}`}>
                                    <FileIcon className="w-6 h-6" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium">{message.fileName || 'Fichier'}</p>
                                    {message.fileSize && (
                                      <p className="text-xs opacity-75">{(message.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                    )}
                                  </div>
                                </a>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-2 ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-xs text-slate-400">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                message.isSending ? (
                                  <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                                ) : message.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-400" />
                                ) : (
                                  <Check className="w-3 h-3 text-slate-400" />
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {(selectedConversation.status === 'closed' || selectedConversation.status === 'completed') ? (
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-center">
                  <p className="text-slate-400 text-sm">
                    {selectedConversation.status === 'closed' 
                      ? '🔒 Cette conversation est fermée. Aucun message ne peut être envoyé.'
                      : '✅ Cette tâche est terminée. La conversation est fermée.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Preview du fichier sélectionné */}
                {selectedFile && (
                  <div className="p-4 border-t border-slate-700 bg-slate-800">
                    <div className="bg-slate-700 rounded-lg p-3 flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 rounded object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-600 rounded flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-slate-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelFile}
                        className="p-2 hover:bg-slate-600 rounded-lg transition text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      width={320}
                      height={400}
                    />
                  </div>
                )}

                {/* Formulaire de message */}
                <form onSubmit={selectedFile ? (e) => { e.preventDefault(); handleSendFile(); } : handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-750">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                      title="Joindre un fichier"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 flex items-center gap-2 bg-slate-700 rounded-full px-4 py-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        placeholder={selectedFile ? "Ajouter un message (optionnel)..." : "Écrivez votre message..."}
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-400"
                        disabled={sending || uploadingFile}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-slate-400 hover:text-white transition"
                        title="Ajouter un emoji"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <motion.button
                      type="submit"
                      disabled={(!newMessage.trim() && !selectedFile) || sending || uploadingFile}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition relative"
                    >
                      {(sending || uploadingFile) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-orange-400" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">Vos Messages</p>
              <p className="text-sm text-slate-400">
                Sélectionnez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation pour terminer la tâche */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowCompleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Marquer la tâche comme terminée</h3>
              </div>

              <p className="text-slate-300 mb-6">
                Félicitations ! La tâche sera marquée comme terminée. Que souhaitez-vous faire avec la conversation ?
              </p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCompleteTask('keep_open')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl text-left transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    <p className="font-semibold text-blue-400 mb-1">Garder ouverte</p>
                    <p className="text-xs text-slate-400">La conversation reste accessible pour d'éventuels échanges</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCompleteTask('close_conversation')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-left transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    <p className="font-semibold text-orange-400 mb-1">Fermer la conversation</p>
                    <p className="text-xs text-slate-400">La conversation sera fermée définitivement</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-400 flex-shrink-0" />
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCompleteModal(false)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </motion.button>

              {actionLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPanel;
