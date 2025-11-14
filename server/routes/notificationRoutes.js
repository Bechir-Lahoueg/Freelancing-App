import express from 'express';
import { protect } from '../middleware/auth.js';
import { protectAdmin } from '../middleware/roleAuth.js';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// Admin routes
router.get('/', protect, protectAdmin, getNotifications);
router.put('/:id/read', protect, protectAdmin, markNotificationAsRead);

export default router;
