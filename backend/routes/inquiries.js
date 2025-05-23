const express = require("express");
const { createInquiry, getInquiries } = require("../controllers/inquiries");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(createInquiry).get(protect, authorize("agent", "admin"), getInquiries);

module.exports = router;