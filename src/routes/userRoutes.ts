import express from 'express';
import { getUserProfile, updateUserCoin } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(protect as express.RequestHandler);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PATCH /api/user/coin
// @desc    Update user coin
// @access  Private
router.patch('/coin', updateUserCoin);

export default router;
