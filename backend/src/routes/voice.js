const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

// POST { transcript: string }
router.post('/parse', voiceController.parseTranscript);

module.exports = router;
