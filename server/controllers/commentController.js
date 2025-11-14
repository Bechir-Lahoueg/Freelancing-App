import { validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import TaskRequest from '../models/TaskRequest.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Créer un nouveau commentaire
// @route   POST /api/comments
// @access  Private (User)
export const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, rating } = req.body;

    // Créer le commentaire
    const comment = await Comment.create({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || null
      },
      text,
      rating,
      status: 'pending',
      isPublished: false
    });

    console.log('💬 New comment created (pending approval):', comment._id);

    // Notifier les admins
    await createNotification(
      'comment_created',
      `Nouveau commentaire en attente d'approbation - ${comment.user.name}`,
      comment
    );

    res.status(201).json({
      message: 'Commentaire créé avec succès! En attente d\'approbation par les administrateurs.',
      comment
    });
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir tous les commentaires approuvés (publics)
// @route   GET /api/comments/public
// @access  Public
export const getPublicComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      status: 'approved',
      isPublished: true
    }).sort({ createdAt: -1 });

    // S'assurer que c'est un array
    const commentList = Array.isArray(comments) ? comments : [];
    res.json(commentList);
  } catch (error) {
    console.error('❌ Error fetching public comments:', error);
    res.json([]);
  }
};

// @desc    Obtenir tous les commentaires (pour les admins)
// @route   GET /api/comments/admin/pending
// @access  Private (Admin)
export const getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approuver un commentaire
// @route   PUT /api/admin/comments/:id/approve
// @access  Private (Admin)
export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    comment.status = 'approved';
    comment.isPublished = true;
    comment.approvedAt = new Date();
    comment.approvedBy = req.user._id;

    await comment.save();

    console.log('✅ Comment approved:', comment._id);

    res.json({
      message: 'Commentaire approuvé et publié!',
      comment
    });
  } catch (error) {
    console.error('❌ Error approving comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rejeter un commentaire
// @route   PUT /api/admin/comments/:id/reject
// @access  Private (Admin)
export const rejectComment = async (req, res) => {
  try {
    const { reason } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    comment.status = 'rejected';
    comment.isPublished = false;
    comment.rejectionReason = reason || 'Rejeté par l\'administrateur';
    comment.approvedBy = req.user._id;

    await comment.save();

    console.log('❌ Comment rejected:', comment._id);

    res.json({
      message: 'Commentaire rejeté',
      comment
    });
  } catch (error) {
    console.error('❌ Error rejecting comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un commentaire (Admin only)
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    console.log('🗑️ Comment deleted:', req.params.id);

    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les commentaires de l'utilisateur
// @route   GET /api/comments/my-comments
// @access  Private (User)
export const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 'user._id': req.user._id })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('❌ Error fetching user comments:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer son propre commentaire
// @route   DELETE /api/comments/:id
// @access  Private (User)
export const deleteOwnComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Vérifier que c'est le propriétaire du commentaire
    if (comment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez que supprimer vos propres commentaires' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    console.log('🗑️ User deleted their comment:', req.params.id);

    // Notifier les admins que le commentaire a été supprimé
    await createNotification(
      'comment_deleted',
      `Commentaire supprimé par l'utilisateur - ${comment.user.name}`,
      comment
    );

    res.json({ message: 'Votre commentaire a été supprimé' });
  } catch (error) {
    console.error('❌ Error deleting own comment:', error);
    res.status(500).json({ message: error.message });
  }
};
