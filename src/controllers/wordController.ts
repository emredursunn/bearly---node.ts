import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import { SavedWord } from '../types';

// Get user words for a specific language
export const getUserWords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const languages = user.languages as { [key: string]: { stories: any[], words: SavedWord[] } };
    const userLanguage = languages[language] || { stories: [], words: [] };

    res.status(200).json({
      success: true,
      data: userLanguage.words || []
    });
  } catch (error) {
    console.error('Get words error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Save a new word for a specific language
export const saveWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const { word, meaning } = req.body;

    if (!word || !meaning) {
      res.status(400).json({
        success: false,
        message: 'Word and meaning are required'
      });
      return;
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Create a new word with a unique ID
    const newWord: SavedWord = {
      id: uuidv4(),
      word,
      meaning
    };

    // Get current languages data or initialize if it doesn't exist
    const languages = user.languages as { [key: string]: { stories: any[], words: SavedWord[] } };
    
    if (!languages[language]) {
      languages[language] = { stories: [], words: [] };
    }
    
    // Add the new word
    languages[language].words = [...(languages[language].words || []), newWord];

    // Update user with new languages data
    user.set('languages', languages);
    user.changed('languages', true); // Explicitly mark the field as changed
    await user.save({fields: ['languages']});

    res.status(201).json({
      success: true,
      data: newWord
    });
  } catch (error) {
    console.error('Save word error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a word for a specific language
export const deleteWord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, wordId } = req.params;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get current languages data
    const languages = user.languages as { [key: string]: { stories: any[], words: SavedWord[] } };
    
    if (!languages[language] || !languages[language].words) {
      res.status(404).json({
        success: false,
        message: 'No words found for this language'
      });
      return;
    }
    
    // Filter out the word to delete
    const updatedWords = languages[language].words.filter(word => word.id !== wordId);
    
    if (languages[language].words.length === updatedWords.length) {
      res.status(404).json({
        success: false,
        message: 'Word not found'
      });
      return;
    }
    
    // Update the words array
    languages[language].words = updatedWords;
    user.set('languages', languages);
    user.changed('languages', true); // Explicitly mark the field as changed
    await user.save({fields: ['languages']});

    res.status(200).json({
      success: true,
      message: 'Word deleted successfully'
    });
  } catch (error) {
    console.error('Delete word error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
