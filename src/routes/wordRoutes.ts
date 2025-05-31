import express from 'express';
import { getUserWords, saveWord, deleteWord } from '../controllers/wordController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(protect as express.RequestHandler);

// @route   GET /api/words/:language
// @desc    Get user words for a specific language
// @access  Private
router.get('/:language', getUserWords);

// @route   POST /api/words/:language
// @desc    Save a new word for a specific language
// @access  Private
router.post('/:language', saveWord);

// @route   DELETE /api/words/:language/:wordId
// @desc    Delete a word
// @access  Private
router.delete('/:language/:wordId', deleteWord);

export default router;
