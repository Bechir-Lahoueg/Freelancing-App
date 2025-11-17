import Notification from '../models/Notification.js';

// Fonction pour creer et emettre une notification
export const createAndEmitNotification = async (io, notificationData) => {
  try {
    const { userId, type, title, message, relatedId, relatedModel } = notificationData;

    // Creer la notification dans la base de donnees
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedModel
    });

    // Recuperer la notification avec les donnees populees
    const populatedNotification = await Notification.findById(notification._id)
      .populate('user', 'name email');

    // Emettre via Socket.IO a l'utilisateur specifique
    io.to(userId.toString()).emit('notification', populatedNotification);

    // Si c'est pour un admin, emettre aussi a tous les admins
    if (type.includes('task') || type.includes('partner') || type.includes('message')) {
      io.emit('admin-notification', populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error('Erreur creation notification:', error);
    return null;
  }
};

// Notifications pour les demandes de partenariat
export const notifyPartnerRequest = async (io, partnerRequest) => {
  // Notifier tous les admins
  const User = (await import('../models/User.js')).default;
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });

  for (const admin of admins) {
    await createAndEmitNotification(io, {
      userId: admin._id,
      type: 'partner_request',
      title: '🤝 Nouvelle demande de partenariat',
      message: `${partnerRequest.fullName} a soumis une demande de partenariat`,
      relatedId: partnerRequest._id,
      relatedModel: 'PartnerRequest'
    });
  }
};

// Notifications pour les taches
export const notifyTaskCreated = async (io, task, clientId) => {
  // Notifier tous les admins
  const User = (await import('../models/User.js')).default;
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });

  for (const admin of admins) {
    await createAndEmitNotification(io, {
      userId: admin._id,
      type: 'task_created',
      title: '💼 Nouvelle tache creee',
      message: `Une nouvelle tache a ete creee: ${task.title}`,
      relatedId: task._id,
      relatedModel: 'TaskRequest'
    });
  }
};

export const notifyTaskUpdated = async (io, task, clientId) => {
  await createAndEmitNotification(io, {
    userId: clientId,
    type: 'task_updated',
    title: '✏️ Tache mise a jour',
    message: `Votre tache "${task.title}" a ete mise a jour`,
    relatedId: task._id,
    relatedModel: 'TaskRequest'
  });
};

export const notifyTaskCompleted = async (io, task, clientId) => {
  await createAndEmitNotification(io, {
    userId: clientId,
    type: 'task_completed',
    title: '✅ Tache terminee',
    message: `Votre tache "${task.title}" a ete marquee comme terminee`,
    relatedId: task._id,
    relatedModel: 'TaskRequest'
  });
};

// Notifications pour les messages
export const notifyNewMessage = async (io, conversation, senderId, receiverId) => {
  await createAndEmitNotification(io, {
    userId: receiverId,
    type: 'message_received',
    title: '💬 Nouveau message',
    message: `Vous avez recu un nouveau message`,
    relatedId: conversation._id,
    relatedModel: 'Conversation'
  });
};

// Notifications pour les demandes de partenariat (approbation/rejet)
export const notifyPartnerApproved = async (io, partnerRequest) => {
  // Note: Le candidat n'a pas de compte, donc on ne cree pas de notification
  // L'admin doit envoyer l'email manuellement
  console.log(`Demande de partenariat approuvee pour ${partnerRequest.email}`);
};

export const notifyPartnerRejected = async (io, partnerRequest) => {
  // Note: Le candidat n'a pas de compte, donc on ne cree pas de notification
  // L'admin doit envoyer l'email manuellement
  console.log(`Demande de partenariat rejetee pour ${partnerRequest.email}`);
};

// Notifications pour les factures
export const notifyInvoiceCreated = async (io, invoice, clientId) => {
  await createAndEmitNotification(io, {
    userId: clientId,
    type: 'invoice_created',
    title: '📄 Nouvelle facture',
    message: `Une nouvelle facture de ${invoice.totalAmount}DT a ete creee`,
    relatedId: invoice._id,
    relatedModel: 'Invoice'
  });
};

export const notifyInvoicePaid = async (io, invoice, clientId) => {
  await createAndEmitNotification(io, {
    userId: clientId,
    type: 'invoice_paid',
    title: '💰 Facture payee',
    message: `Votre paiement de ${invoice.totalAmount}DT a ete confirme`,
    relatedId: invoice._id,
    relatedModel: 'Invoice'
  });

  // Notifier aussi les admins
  const User = (await import('../models/User.js')).default;
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });

  for (const admin of admins) {
    await createAndEmitNotification(io, {
      userId: admin._id,
      type: 'invoice_paid',
      title: '💰 Paiement recu',
      message: `Paiement de ${invoice.totalAmount}DT recu`,
      relatedId: invoice._id,
      relatedModel: 'Invoice'
    });
  }
};
