import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Retry configuration
const MAX_RETRIES = 5;
const BASE_DELAY = 100; // ms

async function withRetry(operation, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt === retries || 
        !error.errorLabels?.includes('TransientTransactionError')
      ) {
        throw error;
      }
      
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Get user game data
router.get('/game-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      balance: user.gameData.balance,
      completedMissions: user.gameData.completedMissions,
      prisonTime: user.gameData.prisonTime,
      cooldowns: Object.fromEntries(user.gameData.cooldowns)
    });
  } catch (error) {
    console.error('Error fetching game data:', error);
    res.status(500).json({ message: 'Error fetching game data' });
  }
});

// Save game data with optimistic locking and retry mechanism
router.post('/save-game', auth, async (req, res) => {
  try {
    const { balance, completedMissions, prisonTime, cooldowns } = req.body;
    
    // Validate data before starting transaction
    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ message: 'Invalid balance value' });
    }

    if (!Array.isArray(completedMissions)) {
      return res.status(400).json({ message: 'Invalid completedMissions format' });
    }

    const result = await withRetry(async () => {
      const session = await User.startSession();
      
      try {
        session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' }
        });

        const user = await User.findById(req.user.userId).session(session);
        if (!user) {
          throw new Error('User not found');
        }

        // Update game data
        user.gameData = {
          balance: balance || 0,
          completedMissions: completedMissions || [],
          prisonTime: prisonTime ? new Date(prisonTime) : null,
          cooldowns: new Map(Object.entries(cooldowns || {}))
        };
        await user.save({ session });
        await session.commitTransaction();

        return {
          balance: user.gameData.balance,
          completedMissions: user.gameData.completedMissions,
          prisonTime: user.gameData.prisonTime,
          cooldowns: Object.fromEntries(user.gameData.cooldowns)
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    });

    res.json({ 
      message: 'Game data saved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error saving game data:', error);
    res.status(500).json({ message: 'Error saving game data' });
  }
});

export default router;
