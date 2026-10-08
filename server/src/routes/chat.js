import express from 'express';
import { llmService } from '../services/llmService.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: "messages" array is required' });
    }

    const response = await llmService.chat(messages);
    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Error processing chat request');
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
