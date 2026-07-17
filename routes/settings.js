const express = require("express");
const settingsController = require("../controllers/settingsController");
const protectAdmin = require("../middleware/protectAdmin");

const router = express.Router();

router.get("/", settingsController.getSettings);
router.put("/", protectAdmin, settingsController.updateSettings);

module.exports = router;
