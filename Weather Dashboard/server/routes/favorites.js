import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Add a city to favorites
// @route   POST /api/favorites
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({ message: 'City name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { favoriteCities: city } },
            { new: true }
        );

        res.status(200).json(user.favoriteCities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get user's favorite cities
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(user.favoriteCities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Remove a city from favorites
// @route   DELETE /api/favorites
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({ message: 'City name is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { favoriteCities: city } },
            { new: true }
        );

        res.status(200).json(user.favoriteCities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
