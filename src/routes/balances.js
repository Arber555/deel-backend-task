const express = require("express");
const { getProfile } = require("../middleware/getProfile");
const router = express.Router();
const balanceServices = require("../services/balances.js");

router.post("/balances/deposit/:userId", getProfile, balanceServices.deposit);

module.exports = router;
