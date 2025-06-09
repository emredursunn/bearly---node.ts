import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import { Story } from '../types';

// Get user stories for a specific language
export const getUserStories = async (req: Request, res: Response): Promise<void> => {
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

    const languages = user.languages as { [key: string]: { stories: Story[], words: any[] } };
    const userLanguage = languages[language] || { stories: [], words: [] };

    const storiesWithoutContent = (userLanguage.stories || []).map(story => {
      const { content, ...storyWithoutContent } = story;
      return storyWithoutContent;
    });

    res.status(200).json({
      success: true,
      data: storiesWithoutContent
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Save a new story for a specific language
export const saveStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language } = req.params;
    const storyData = req.body;

    if (!storyData.title || !storyData.content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required'
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

    // Create a new story with a unique ID
    const newStory: Story = {
      id: uuidv4(),
      title: storyData.title,
      content: storyData.content,
      language,
      level: storyData.level,
      minutes: storyData.minutes,
      words: storyData.words,
      genre: storyData.genre,
      thumbnail: storyData.thumbnail,
      description: storyData.description,
      coverImageUri: storyData.coverImageUri
    };

    // Get current languages data or initialize if it doesn't exist
    const languages = user.languages as { [key: string]: { stories: Story[], words: any[] } };
    
    if (!languages[language]) {
      languages[language] = { stories: [], words: [] };
    }
    
    // Add the new story
    languages[language].stories = [...(languages[language].stories || []), newStory];

    // Update user with new languages data
    user.set('languages', languages);
    user.changed('languages', true); // Explicitly mark the field as changed
    await user.save({fields: ['languages']});

    res.status(201).json({
      success: true,
      data: newStory
    });
  } catch (error) {
    console.error('Save story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a story for a specific language
export const deleteStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, storyId } = req.params;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get current languages data
    const languages = user.languages as { [key: string]: { stories: Story[], words: any[] } };
    
    if (!languages[language] || !languages[language].stories) {
      res.status(404).json({
        success: false,
        message: 'No stories found for this language'
      });
      return;
    }
    
    // Filter out the story to delete
    const updatedStories = languages[language].stories.filter(story => story.id !== storyId);
    
    if (languages[language].stories.length === updatedStories.length) {
      res.status(404).json({
        success: false,
        message: 'Story not found'
      });
      return;
    }
    
    // Update the stories array
    languages[language].stories = updatedStories;
    user.set('languages', languages);
    user.changed('languages', true); // Explicitly mark the field as changed
    await user.save({fields: ['languages']});

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get specific story content for a specific language
export const getStoryContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, storyId } = req.params;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const languages = user.languages as { [key: string]: { stories: Story[], words: any[] } };
    const userLanguage = languages[language] || { stories: [], words: [] };

    const story = (userLanguage.stories || []).find(s => s.id === storyId);

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Story not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: story // Return the full story object, including content
    });
  } catch (error) {
    console.error('Get story content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
