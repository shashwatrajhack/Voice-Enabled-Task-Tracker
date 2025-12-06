const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");

router.post("/parse", voiceController.parseTranscript);

module.exports = router;
