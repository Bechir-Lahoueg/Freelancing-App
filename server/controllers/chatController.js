import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import TaskRequest from '../models/TaskRequest.js';

// @desc    Creer une nouvelle conversation (appele automatiquement lors de l'approbation)
// @route   POST /api/chat/conversations
// @access  Private (Admin)
export const createConversation = async (req, res) => {
  try {
    const { taskRequestId, userId } = req.body;

    // Verifier si une conversation existe deja pour cette tache
    let conversation = await Conversation.findOne({ taskRequestId });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    // Recuperer la tache pour avoir les infos
    const taskRequest = await TaskRequest.findById(taskRequestId).populate('userId');

    if (!taskRequest) {
      return res.status(404).json({ message: 'Demande de service introuvable' });
    }

    // Creer la conversation avec l'utilisateur et le super admin
    conversation = await Conversation.create({
      taskRequestId,
      participants: [
        {
          userId: taskRequest.userId._id,
          role: 'user'
        },
        {
          userId: req.user._id, // Le super admin qui approuve
          role: req.user.role
        }
      ],
      unreadCount: {
        [taskRequest.userId._id]: 0,
        [req.user._id]: 0
      }
    });

    // Creer un message systeme
    const systemMessage = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      content: `Conversation creee pour le service "${taskRequest.title}". Vous pouvez maintenant discuter avec le client.`,
      messageType: 'system'
    });

    conversation.lastMessage = {
      content: systemMessage.content,
      senderId: systemMessage.senderId,
      timestamp: systemMessage.createdAt
    };
    await conversation.save();

    // Populer les donnees
    await conversation.populate([
      { path: 'participants.userId', select: 'name email' },
      { path: 'taskRequestId', select: 'title status' }
    ]);

    res.status(201).json(conversation);
  } catch (error) {
    console.error('❌ Erreur creation conversation:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir toutes les conversations de l'utilisateur connecte
// @route   GET /api/chat/conversations
// @access  Private
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id,
      status: { $in: ['active', 'closed', 'completed'] }
    })
      .populate('participants.userId', 'name email role')
      .populate('taskRequestId', 'title status')
      .populate('lastMessage.senderId', 'name')
      .sort({ 'lastMessage.timestamp': -1 });

    res.json(conversations);
  } catch (error) {
    console.error('❌ Erreur recuperation conversations:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    // Verifier que l'utilisateur fait partie de la conversation
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Acces non autorise' });
    }

    // Construire la requete pour filtrer les messages
    const query = { 
      conversationId: id,
      $or: [
        { recipientId: { $exists: false } }, // Messages sans destinataire specifique (visibles par tous)
        { recipientId: null }, // Messages sans destinataire
        { recipientId: req.user._id }, // Messages destines a cet utilisateur
        { senderId: req.user._id } // Messages envoyes par cet utilisateur
      ]
    };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('❌ Erreur recuperation messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Envoyer un message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType = 'text', fileUrl, fileName, fileSize, mimeType } = req.body;

    // Verifier la conversation
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Acces non autorise' });
    }

    // Creer le message
    const message = await Message.create({
      conversationId: id,
      senderId: req.user._id,
      content: content || (messageType !== 'text' ? `Fichier partage: ${fileName}` : ''),
      messageType,
      fileUrl,
      fileName,
      fileSize,
      mimeType
    });

    // Mettre a jour la conversation
    conversation.lastMessage = {
      content: messageType === 'text' ? content : `📎 ${fileName || 'Fichier'}`,
      senderId: req.user._id,
      timestamp: message.createdAt
    };

    // Incrementer le compteur de non-lus pour les autres participants
    conversation.participants.forEach(participant => {
      if (participant.userId.toString() !== req.user._id.toString()) {
        const userId = participant.userId.toString();
        const currentCount = conversation.unreadCount.get(userId) || 0;
        conversation.unreadCount.set(userId, currentCount + 1);
      }
    });

    await conversation.save();

    // Populer le message
    await message.populate('senderId', 'name email role');

    // Emettre via Socket.IO
    const io = req.app.get('io');
    io.to(id).emit('message:received', {
      message,
      conversationId: id
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer les messages comme lus
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    // Reinitialiser le compteur de non-lus pour cet utilisateur
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    // Marquer tous les messages non lus comme lus
    await Message.updateMany(
      {
        conversationId: id,
        senderId: { $ne: req.user._id },
        isRead: false
      },
      {
        $set: { isRead: true },
        $push: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Notifier via Socket.IO
    const io = req.app.get('io');
    io.to(id).emit('messages:read', {
      conversationId: id,
      userId: req.user._id
    });

    res.json({ message: 'Messages marques comme lus' });
  } catch (error) {
    console.error('❌ Erreur marquage messages lus:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Archiver une conversation
// @route   PUT /api/chat/conversations/:id/archive
// @access  Private
export const archiveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    res.json({ message: 'Conversation archivee' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rechercher une conversation par code
// @route   GET /api/chat/conversations/search/:code
// @access  Private (Admin)
export const searchConversationByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const conversation = await Conversation.findOne({ conversationCode: code.toUpperCase() })
      .populate('participants.userId', 'name email role')
      .populate('taskRequestId', 'title status')
      .populate('lastMessage.senderId', 'name');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    // Recuperer les messages de cette conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    res.json({
      conversation,
      messages,
      assignedAgent: conversation.assignedAgent
    });
  } catch (error) {
    console.error('❌ Erreur recherche conversation:', error);
    res.status(500).json({ message: error.message });
  }
};
