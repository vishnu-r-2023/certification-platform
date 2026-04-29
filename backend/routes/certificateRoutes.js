const express = require("express");
const { getCertificate } = require("../controllers/certificateController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:courseId", protect, getCertificate);

module.exports = router;
