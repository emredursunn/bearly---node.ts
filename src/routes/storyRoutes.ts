import express from 'express';
import { getUserStories, saveStory, deleteStory } from '../controllers/storyController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(protect as express.RequestHandler);

// @route   GET /api/stories/:language
// @desc    Get user stories for a specific language
// @access  Private
router.get('/:language', getUserStories);

// @route   POST /api/stories/:language
// @desc    Save a new story for a specific language
// @access  Private
router.post('/:language', saveStory);

// @route   DELETE /api/stories/:language/:storyId
// @desc    Delete a story
// @access  Private
router.delete('/:language/:storyId', deleteStory);

export default router;
