const express = require('express');
const router = express.Router();
const Avatar = require('../models/avatar_schema');
const auth = require('../middleware/auth');

// @route   POST api/avatars
// @desc    Create a new avatar
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, personality, specialization, appearance, voiceType, isPremium } = req.body;

    const newAvatar = new Avatar({
      user: req.user.id,
      name,
      personality,
      specialization,
      appearance,
      voiceType,
      isPremium: isPremium || false
    });

    const avatar = await newAvatar.save();
    res.json(avatar);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/avatars
// @desc    Get all avatars for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const avatars = await Avatar.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(avatars);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/avatars/:id
// @desc    Get avatar by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.id);
    
    if (!avatar) {
      return res.status(404).json({ msg: 'Avatar not found' });
    }

    // Ensure user owns the avatar
    if (avatar.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(avatar);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Avatar not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT api/avatars/:id
// @desc    Update avatar
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.id);
    
    if (!avatar) {
      return res.status(404).json({ msg: 'Avatar not found' });
    }

    // Ensure user owns the avatar
    if (avatar.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedAvatar = await Avatar.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );

    res.json(updatedAvatar);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Avatar not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/avatars/:id
// @desc    Delete avatar
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.id);
    
    if (!avatar) {
      return res.status(404).json({ msg: 'Avatar not found' });
    }

    // Ensure user owns the avatar
    if (avatar.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await avatar.remove();
    res.json({ msg: 'Avatar removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Avatar not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;