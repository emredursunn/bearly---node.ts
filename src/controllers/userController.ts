import { Request, Response } from 'express';
import User from '../models/User';

// Get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user coin
export const getUserCoin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        coin: user.coin
      }
    });
  } catch (error) {
    console.error('Get coin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user coin
export const updateUserCoin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coin } = req.body;

    if (typeof coin !== 'number' || coin < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid coin value'
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

    user.coin = coin;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        coin: user.coin
      }
    });
  } catch (error) {
    console.error('Update coin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
