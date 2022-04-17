const express = require("express");
const { getProfile } = require("../middleware/getProfile");
const router = express.Router();
const jobServices = require("../services/jobs.js");

router.get("/jobs/unpaid", getProfile, jobServices.findUnpaid);

router.post("/jobs/:job_id/pay", getProfile, jobServices.pay);

module.exports = router;
